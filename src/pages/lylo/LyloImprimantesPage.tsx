import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/lylo/Button";
import { Input } from "../../components/ui/lylo/Input";
import { Label } from "../../components/ui/lylo/Label";
import { Modal } from "../../components/ui/lylo/Modal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Printer = {
  id: string | number;
  name: string;
  location: string;
  ip: string;
  port: number;
  is_active: boolean;
  protocol?: string;
  printnode_id?: string | number;
};

type PrinterFormState = {
  name: string;
  location: string;
  ip: string;
  port: string;
  is_active: boolean;
};

// Résultat du scan réseau
type ScannedDevice = {
  ip: string;
  port?: number;
  hostname?: string;
};

// Imprimante côté PrintNode
type PrintNodePrinter = {
  printnode_id: string | number;
  name: string;
  state: string;
};

// Résultat complet du scan
type ScanResult = {
  printers: ScannedDevice[];
  printnode_printers: PrintNodePrinter[];
};

// Sélection en cours pour un device scanné (printnode_id → location)
type DeviceSelection = {
  printnode_id: string; // "" = rien sélectionné
  location: string;
};

// "choice"   → écran choix (scanner / manuel)
// "scanning" → loader
// "results"  → liste devices + dropdowns PrintNode
// "form"     → formulaire manuel
type AddStep = "choice" | "scanning" | "results" | "form";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOCATION_OPTIONS = ["caisse", "cuisine", "bar", "autre"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBackendBaseUrl() {
  const base = (import.meta.env.VITE_LYLO_API_URL || 'https://lylo-back-production.up.railway.app').trim();
  return base ? base.replace(/\/+$/, "") : "";
}

async function apiFetch(path: string, init?: RequestInit) {
  const base = getBackendBaseUrl();
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let details = "";
    try { details = await res.text(); } catch { /* ignore */ }
    throw new Error(`HTTP ${res.status} ${res.statusText}${details ? ` — ${details}` : ""}`);
  }

  if (res.status === 204) return null;
  const contentLength = res.headers.get("content-length");
  if (contentLength === "0") return null;
  return (await res.json()) as unknown;
}

function normalizePrinters(payload: unknown): Printer[] {
  if (Array.isArray(payload)) return payload as Printer[];
  if (payload && typeof payload === "object") {
    const maybe = (payload as Record<string, unknown>).data;
    if (Array.isArray(maybe)) return maybe as Printer[];
  }
  return [];
}

function normalizeScanResult(payload: unknown): ScanResult {
  const empty: ScanResult = { printers: [], printnode_printers: [] };
  if (!payload || typeof payload !== "object") return empty;
  const p = payload as Record<string, unknown>;

  const printers: ScannedDevice[] = Array.isArray(p.printers)
    ? (p.printers as ScannedDevice[])
    : [];
  const printnode_printers: PrintNodePrinter[] = Array.isArray(p.printnode_printers)
    ? (p.printnode_printers as PrintNodePrinter[])
    : [];

  return { printers, printnode_printers };
}

function emptyForm(): PrinterFormState {
  return { name: "", location: "", ip: "", port: "9100", is_active: true };
}

function printerToForm(p: Printer): PrinterFormState {
  return { name: p.name, location: p.location, ip: p.ip, port: String(p.port), is_active: p.is_active };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LyloImprimantesPage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [search, setSearch] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // — Add flow
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addStep, setAddStep] = useState<AddStep>("choice");
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult>({ printers: [], printnode_printers: [] });
  // ip → sélection en cours
  const [selections, setSelections] = useState<Record<string, DeviceSelection>>({});
  // ip du device en cours de confirmation
  const [confirmingIp, setConfirmingIp] = useState<string | null>(null);
  // Formulaire manuel
  const [createForm, setCreateForm] = useState<PrinterFormState>(emptyForm());

  // — Edit flow
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editForm, setEditForm] = useState<PrinterFormState>(emptyForm());

  // ---------------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------------

  async function refreshPrinters() {
    setError(null);
    setIsBusy(true);
    try {
      const data = await apiFetch("/printers/");
      setPrinters(normalizePrinters(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  useEffect(() => {
    const t = window.setTimeout(() => { void refreshPrinters(); }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const filteredPrinters = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return printers;
    return printers.filter((p) =>
      `${p.name} ${p.location} ${p.ip}`.toLowerCase().includes(q)
    );
  }, [printers, search]);

  const selectedPrinter = useMemo(
    () => selectedId ? printers.find((p) => String(p.id) === selectedId) ?? null : null,
    [printers, selectedId],
  );

  // ---------------------------------------------------------------------------
  // Add flow — scan
  // ---------------------------------------------------------------------------

  function openAdd() {
    setCreateForm(emptyForm());
    setScanResult({ printers: [], printnode_printers: [] });
    setSelections({});
    setConfirmingIp(null);
    setScanError(null);
    setAddStep("choice");
    setIsAddOpen(true);
  }

  function closeAdd() {
    setIsAddOpen(false);
    setConfirmingIp(null);
  }

  async function startScan() {
    setScanError(null);
    setSelections({});
    setConfirmingIp(null);
    setAddStep("scanning");
    try {
      const data = await apiFetch("/printers/network/scan");
      setScanResult(normalizeScanResult(data));
      setAddStep("results");
    } catch (e) {
      setScanError(e instanceof Error ? e.message : "Erreur lors du scan");
      setAddStep("results");
    }
  }

  function setDevicePrintNode(ip: string, printnode_id: string) {
    // Pré-remplir le nom depuis la liste PrintNode
    const pn = scanResult.printnode_printers.find((p) => String(p.printnode_id) === printnode_id);
    setSelections((prev) => ({
      ...prev,
      [ip]: { printnode_id, location: prev[ip]?.location ?? "" },
    }));
    // Si on ouvre le formulaire de confirmation pour ce device, sync le nom
    if (confirmingIp === ip && pn) {
      setCreateForm((f) => ({ ...f, name: pn.name }));
    }
  }


  function openConfirm(device: ScannedDevice) {
    const sel = selections[device.ip];
    const pn = scanResult.printnode_printers.find(
      (p) => String(p.printnode_id) === sel?.printnode_id
    );
    setCreateForm({
      name: pn?.name ?? "",
      location: sel?.location ?? "",
      ip: device.ip,
      port: String(device.port ?? 9100),
      is_active: true,
    });
    setConfirmingIp(device.ip);
  }

  // ---------------------------------------------------------------------------
  // Add flow — submit
  // ---------------------------------------------------------------------------

  async function submitScanCreate() {
    if (!confirmingIp) return;
    const sel = selections[confirmingIp];
    const name = createForm.name.trim();
    const location = createForm.location.trim();
    const ip = createForm.ip.trim();
    const port = Number.parseInt(createForm.port, 10);
    if (!name || !location || !ip || !Number.isFinite(port) || !sel?.printnode_id) return;

    setError(null);
    setIsBusy(true);
    try {
      await apiFetch("/printers/", {
        method: "POST",
        body: JSON.stringify({
          name,
          location,
          ip,
          port,
          protocol: "printnode",
          printnode_id: sel.printnode_id,
        }),
      });
      closeAdd();
      await refreshPrinters();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  function openManualForm() {
    setCreateForm(emptyForm());
    setConfirmingIp(null);
    setAddStep("form");
  }

  async function submitManualCreate() {
    const name = createForm.name.trim();
    const location = createForm.location.trim();
    const ip = createForm.ip.trim();
    const port = Number.parseInt(createForm.port, 10);
    if (!name || !location || !ip || !Number.isFinite(port)) return;

    setError(null);
    setIsBusy(true);
    try {
      await apiFetch("/printers/", {
        method: "POST",
        body: JSON.stringify({ name, location, ip, port, is_active: createForm.is_active }),
      });
      closeAdd();
      await refreshPrinters();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Edit / Delete
  // ---------------------------------------------------------------------------

  function openDetail(printer: Printer) {
    setSelectedId(String(printer.id));
    setEditForm(printerToForm(printer));
    setIsDetailOpen(true);
  }

  async function saveDetail() {
    if (!selectedPrinter) return;
    const name = editForm.name.trim();
    const location = editForm.location.trim();
    const ip = editForm.ip.trim();
    const port = Number.parseInt(editForm.port, 10);
    if (!name || !location || !ip || !Number.isFinite(port)) return;

    setError(null);
    setIsBusy(true);
    try {
      await apiFetch(`/printers/${encodeURIComponent(String(selectedPrinter.id))}`, {
        method: "PATCH",
        body: JSON.stringify({ name, location, ip, port, is_active: editForm.is_active }),
      });
      setIsDetailOpen(false);
      await refreshPrinters();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteSelected() {
    if (!selectedPrinter) return;
    const ok = window.confirm(`Supprimer l'imprimante "${selectedPrinter.name}" ?`);
    if (!ok) return;
    setError(null);
    setIsBusy(true);
    try {
      await apiFetch(`/printers/${encodeURIComponent(String(selectedPrinter.id))}`, { method: "DELETE" });
      setIsDetailOpen(false);
      setSelectedId(null);
      await refreshPrinters();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsBusy(false);
    }
  }

  async function toggleActive(printer: Printer, e: React.MouseEvent) {
    e.stopPropagation();
    setError(null);
    try {
      await apiFetch(`/printers/${encodeURIComponent(String(printer.id))}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !printer.is_active }),
      });
      await refreshPrinters();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }

  // ---------------------------------------------------------------------------
  // Add modal — dynamic title & footer
  // ---------------------------------------------------------------------------

  const addModalTitle =
    addStep === "choice" ? "Ajouter une imprimante"
    : addStep === "scanning" ? "Scan du réseau…"
    : addStep === "results" ? confirmingIp ? "Confirmer l'imprimante" : "Imprimantes détectées"
    : "Ajouter manuellement";

  function addModalFooter() {
    if (addStep === "choice") {
      return <Button type="button" onClick={closeAdd}>Annuler</Button>;
    }
    if (addStep === "scanning") {
      return null;
    }
    if (addStep === "results" && confirmingIp) {
      const sel = selections[confirmingIp];
      return (
        <>
          <Button type="button" onClick={() => setConfirmingIp(null)}>Retour</Button>
          <div className="flex-1" />
          <Button
            variant="primary"
            type="button"
            onClick={submitScanCreate}
            disabled={
              isBusy ||
              !createForm.name.trim() ||
              !createForm.location.trim() ||
              !sel?.printnode_id
            }
          >
            Confirmer
          </Button>
        </>
      );
    }
    if (addStep === "results") {
      return (
        <>
          <Button type="button" onClick={() => setAddStep("choice")}>Retour</Button>
          <div className="flex-1" />
          <Button variant="primary" type="button" onClick={openManualForm}>
            Ajouter manuellement
          </Button>
        </>
      );
    }
    // form (manuel)
    return (
      <>
        <Button type="button" onClick={() => setAddStep("choice")}>Retour</Button>
        <div className="flex-1" />
        <Button
          variant="primary"
          type="button"
          onClick={submitManualCreate}
          disabled={isBusy || !createForm.name.trim() || !createForm.location.trim() || !createForm.ip.trim()}
        >
          Ajouter
        </Button>
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Imprimantes</h2>
            <p className="mt-1 text-sm text-gray-400">
              Gère les imprimantes réseau. Clique sur une ligne pour modifier ou supprimer.
            </p>
          </div>
          <div className="flex w-full md:w-auto">
            <Button variant="primary" type="button" onClick={openAdd} className="w-full md:w-auto">
              <span className="material-symbols-outlined text-[18px]">print</span>
              Ajouter une imprimante
            </Button>
          </div>
        </div>
        {error ? (
          <div className="mt-4 rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-800 bg-gray-950/20 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-semibold text-white">
            Liste des imprimantes <span className="text-gray-500">({filteredPrinters.length})</span>
          </div>
          <div className="w-full md:w-80">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (nom, location, IP)"
              aria-label="Rechercher une imprimante"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-950/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">IP</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Port</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredPrinters.map((p) => (
                <tr
                  key={String(p.id)}
                  className="cursor-pointer transition-colors hover:bg-gray-800/50"
                  onClick={() => openDetail(p)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-white">{p.name}</td>
                  <td className="px-6 py-4 text-sm capitalize text-gray-300">{p.location}</td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-300">{p.ip}</td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-gray-300">{p.port}</td>
                  <td className="px-6 py-4 text-center" onClick={(e) => toggleActive(p, e)}>
                    <Toggle active={p.is_active} />
                  </td>
                </tr>
              ))}
              {filteredPrinters.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center text-sm text-gray-400" colSpan={5}>
                    {isBusy ? "Chargement…" : "Aucune imprimante trouvée."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal — Ajouter */}
      <Modal
        open={isAddOpen}
        title={addModalTitle}
        onClose={closeAdd}
        maxWidthClassName="max-w-xl"
        footer={addModalFooter()}
      >
        {/* Étape 1 — choix */}
        {addStep === "choice" && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={startScan}
              className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-950/30 px-5 py-4 text-left transition-colors hover:border-indigo-500 hover:bg-indigo-600/5"
            >
              <span className="material-symbols-outlined text-[28px] text-indigo-400">wifi_find</span>
              <div>
                <p className="text-sm font-semibold text-white">Scanner le réseau</p>
                <p className="mt-0.5 text-xs text-gray-400">Détecte les imprimantes disponibles (~5-10 s)</p>
              </div>
            </button>
            <button
              type="button"
              onClick={openManualForm}
              className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-950/30 px-5 py-4 text-left transition-colors hover:border-indigo-500 hover:bg-indigo-600/5"
            >
              <span className="material-symbols-outlined text-[28px] text-indigo-400">edit</span>
              <div>
                <p className="text-sm font-semibold text-white">Ajouter manuellement</p>
                <p className="mt-0.5 text-xs text-gray-400">Saisir l'IP, le port et les informations manuellement</p>
              </div>
            </button>
          </div>
        )}

        {/* Étape 2 — scan en cours */}
        {addStep === "scanning" && (
          <div className="flex flex-col items-center gap-5 py-8">
            <ScanSpinner />
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Scan en cours…</p>
              <p className="mt-1 text-xs text-gray-400">
                Recherche des imprimantes sur le réseau local. Cela peut prendre jusqu'à 10 secondes.
              </p>
            </div>
          </div>
        )}

        {/* Étape 3a — résultats + dropdowns PrintNode */}
        {addStep === "results" && !confirmingIp && (
          <div className="space-y-4">
            {scanError ? (
              <div className="rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-400">
                {scanError}
              </div>
            ) : null}

            {scanResult.printers.length === 0 && !scanError ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <span className="material-symbols-outlined text-[40px] text-gray-700">print_disabled</span>
                <p className="text-sm font-semibold text-white">Aucune imprimante détectée</p>
                <p className="text-xs text-gray-400">
                  Vérifie que les imprimantes sont allumées et connectées au réseau.
                </p>
                <Button type="button" variant="primary" onClick={startScan} className="mt-2">
                  Relancer le scan
                </Button>
              </div>
            ) : null}

            {scanResult.printers.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  {scanResult.printers.length} device{scanResult.printers.length > 1 ? "s" : ""} trouvé
                  {scanResult.printers.length > 1 ? "s" : ""}. Associe chaque imprimante réseau à une imprimante PrintNode.
                </p>
                <div className="space-y-3">
                  {scanResult.printers.map((device) => {
                    const sel = selections[device.ip];
                    const hasPn = !!sel?.printnode_id;
                    return (
                      <div
                        key={device.ip}
                        className="rounded-lg border border-gray-800 bg-gray-950/20 p-4 space-y-3"
                      >
                        {/* Device info */}
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-indigo-400">print</span>
                          <span className="font-mono text-sm font-semibold text-white">{device.ip}</span>
                          {device.hostname ? (
                            <span className="text-xs text-gray-500">— {device.hostname}</span>
                          ) : null}
                          {device.port ? (
                            <span className="ml-auto font-mono text-xs text-gray-600">:{device.port}</span>
                          ) : null}
                        </div>

                        {/* Dropdown PrintNode */}
                        <div className="space-y-1">
                          <Label htmlFor={`pn_${device.ip}`}>Imprimante PrintNode</Label>
                          <select
                            id={`pn_${device.ip}`}
                            value={sel?.printnode_id ?? ""}
                            onChange={(e) => setDevicePrintNode(device.ip, e.target.value)}
                            className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          >
                            <option value="">Sélectionner une imprimante PrintNode…</option>
                            {scanResult.printnode_printers.map((pn) => (
                              <option key={String(pn.printnode_id)} value={String(pn.printnode_id)}>
                                {pn.name} ({pn.state})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Bouton confirmer — visible seulement si une imprimante PrintNode est sélectionnée */}
                        {hasPn ? (
                          <div className="flex justify-end">
                            <Button
                              variant="primary"
                              type="button"
                              onClick={() => openConfirm(device)}
                            >
                              Configurer
                              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Étape 3b — formulaire de confirmation après sélection PrintNode */}
        {addStep === "results" && confirmingIp && (
          <div className="space-y-4">
            {/* Recap device */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-950/30 px-4 py-3">
              <span className="material-symbols-outlined text-[18px] text-indigo-400">print</span>
              <span className="font-mono text-sm font-semibold text-white">{confirmingIp}</span>
              {(() => {
                const device = scanResult.printers.find((d) => d.ip === confirmingIp);
                return device?.hostname ? (
                  <span className="text-xs text-gray-500">— {device.hostname}</span>
                ) : null;
              })()}
              <span className="ml-auto font-mono text-xs text-gray-600">
                :{scanResult.printers.find((d) => d.ip === confirmingIp)?.port ?? 9100}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conf_name">Nom</Label>
                <Input
                  id="conf_name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Ex : Imprimante cuisine"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conf_location">Location</Label>
                <input
                  id="conf_location"
                  list="location-suggestions"
                  value={createForm.location}
                  onChange={(e) => setCreateForm((s) => ({ ...s, location: e.target.value }))}
                  placeholder="Ex : caisse, cuisine, bar…"
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <datalist id="location-suggestions">
                  {LOCATION_OPTIONS.map((l) => <option key={l} value={l} />)}
                </datalist>
              </div>
            </div>
          </div>
        )}

        {/* Étape 4 — formulaire manuel */}
        {addStep === "form" && (
          <PrinterForm form={createForm} onChange={setCreateForm} />
        )}
      </Modal>

      {/* Modal — Modifier */}
      <Modal
        open={isDetailOpen && !!selectedPrinter}
        title={selectedPrinter ? `Imprimante — ${selectedPrinter.name}` : "Imprimante"}
        onClose={() => setIsDetailOpen(false)}
        maxWidthClassName="max-w-xl"
        footer={
          selectedPrinter ? (
            <>
              <Button variant="danger" type="button" onClick={deleteSelected}>Supprimer</Button>
              <div className="flex-1" />
              <Button type="button" onClick={() => setIsDetailOpen(false)}>Fermer</Button>
              <Button variant="primary" type="button" onClick={saveDetail} disabled={isBusy}>
                Enregistrer
              </Button>
            </>
          ) : null
        }
      >
        <PrinterForm form={editForm} onChange={setEditForm} />
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Toggle({ active }: { active: boolean }) {
  return (
    <button
      type="button"
      aria-label={active ? "Désactiver" : "Activer"}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        active ? "bg-indigo-600" : "bg-white/20"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-gray-950 shadow transition-transform ${
          active ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function ScanSpinner() {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <svg className="h-16 w-16 animate-spin text-indigo-400" fill="none" viewBox="0 0 64 64" aria-hidden="true">
        <circle className="opacity-20" cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" />
        <path className="opacity-80" d="M32 4a28 28 0 0 1 28 28" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      </svg>
      <span className="material-symbols-outlined absolute text-[24px] text-indigo-400">wifi_find</span>
    </div>
  );
}

function PrinterForm({
  form,
  onChange,
}: {
  form: PrinterFormState;
  onChange: React.Dispatch<React.SetStateAction<PrinterFormState>>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="pf_name">Nom</Label>
        <Input
          id="pf_name"
          value={form.name}
          onChange={(e) => onChange((s) => ({ ...s, name: e.target.value }))}
          placeholder="Ex : Imprimante cuisine"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pf_location">Location</Label>
        <input
          id="pf_location"
          list="location-suggestions"
          value={form.location}
          onChange={(e) => onChange((s) => ({ ...s, location: e.target.value }))}
          placeholder="Ex : caisse, cuisine, bar…"
          className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
        <datalist id="location-suggestions">
          {LOCATION_OPTIONS.map((l) => <option key={l} value={l} />)}
        </datalist>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pf_port">Port</Label>
        <Input
          id="pf_port"
          inputMode="numeric"
          value={form.port}
          onChange={(e) => onChange((s) => ({ ...s, port: e.target.value }))}
          placeholder="9100"
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="pf_ip">Adresse IP</Label>
        <Input
          id="pf_ip"
          value={form.ip}
          onChange={(e) => onChange((s) => ({ ...s, ip: e.target.value }))}
          placeholder="192.168.1.100"
        />
      </div>
      <div className="flex items-center gap-3 md:col-span-2">
        <button
          type="button"
          aria-label={form.is_active ? "Désactiver" : "Activer"}
          onClick={() => onChange((s) => ({ ...s, is_active: !s.is_active }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            form.is_active ? "bg-indigo-600" : "bg-white/20"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-gray-950 shadow transition-transform ${
              form.is_active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm text-gray-300">{form.is_active ? "Active" : "Inactive"}</span>
      </div>
    </div>
  );
}
