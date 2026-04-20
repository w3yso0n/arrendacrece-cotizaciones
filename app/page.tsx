"use client";

import amortizacionJson from "../tabla_amorticacion.json";
import { useMemo, useState } from "react";

type QuoteInput = {
  cliente: string;
  descripcionBien: string;
  valorBienConIva: number;
  ivaPct: number;

  tasaEfectivaPct: number;
  plazoMeses: number;
  rentaMensual: number;
  ratificacion: number;
  valorResidualPct: number;
  depositoMesesRenta: number;
  comisionAperturaPct: number;
  seguroMensual: number;
  gpsMensual: number;
};

type ConceptRow = {
  concepto: string;
  importe: number;
  iva: number;
  total: number;
};

type AmortRow = {
  periodo: number;
  SI: number;
  interes: number;
  amortizacion: number;
};

type MonthlyRow = {
  mes: number;
  saldoInicial: number | null;
  interes: number;
  amortizacion: number;
  rentaBase: number;
  ivaRenta: number;
  rentaTotal: number;
  seguroBase: number;
  ivaSeguro: number;
  seguroTotal: number;
  gpsBase: number;
  ivaGps: number;
  gpsTotal: number;
  totalMes: number;
};

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pct = new Intl.NumberFormat("es-MX", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function toNumber(raw: string) {
  const cleaned = raw.replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function cardClassName(variant: "white" | "blue" = "white") {
  if (variant === "blue") {
    return "rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-lg ring-1 ring-white/15";
  }
  return "rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70";
}

function Input({
  label,
  value,
  onChange,
  prefix,
  suffix,
  inputMode,
  min,
  max,
  step,
  readOnly,
  selectOnFocus,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  min?: number;
  max?: number;
  step?: number;
  readOnly?: boolean;
  selectOnFocus?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-sky-500">
        {prefix ? (
          <span className="text-xs font-semibold text-slate-500">{prefix}</span>
        ) : null}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => {
            if (selectOnFocus && !readOnly) e.currentTarget.select();
          }}
          inputMode={inputMode}
          min={min}
          max={max}
          step={step}
          readOnly={readOnly}
          className={`w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 ${
            readOnly ? "cursor-not-allowed opacity-70" : ""
          }`}
        />
        {suffix ? (
          <span className="text-xs font-semibold text-slate-500">{suffix}</span>
        ) : null}
      </div>
    </label>
  );
}

function Button({
  children,
  onClick,
  variant = "secondary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "secondary" | "primary";
}) {
  const cls =
    variant === "primary"
      ? "rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 active:bg-sky-800"
      : "rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 active:bg-slate-100";
  return (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  );
}

export default function Home() {
  const initial: QuoteInput = {
    cliente: "",
    descripcionBien: "",
    valorBienConIva: 580_000,
    ivaPct: 16,

    tasaEfectivaPct: 24,
    plazoMeses: 36,
    rentaMensual: 18_500,
    ratificacion: 0,
    valorResidualPct: 10,
    depositoMesesRenta: 1,
    comisionAperturaPct: 2,
    seguroMensual: 850,
    gpsMensual: 350,
  };

  const [form, setForm] = useState<QuoteInput>(initial);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [tab, setTab] = useState<"cotizador" | "mensual">("cotizador");

  const derived = useMemo(() => {
    const ivaRate = clampNumber(form.ivaPct / 100, 0, 1);

    const tasaEfectiva = clampNumber(form.tasaEfectivaPct / 100, 0, 10);
    const tasaImplicitaPct =
      ((Math.pow(1 + tasaEfectiva, 1 / 12) - 1) * 12) * 100;

    const divisor = 1 + ivaRate;
    const valorBienSinIva = divisor > 0 ? form.valorBienConIva / divisor : 0;
    const ivaBien = form.valorBienConIva - valorBienSinIva;
    const valorConIva = form.valorBienConIva;

    const amortData = (amortizacionJson.data ?? []) as AmortRow[];
    const basePrincipal =
      amortData.length > 0 ? amortData[0]!.SI : Math.max(1, valorBienSinIva);
    const scale = basePrincipal > 0 ? valorBienSinIva / basePrincipal : 1;

    const meses = clampNumber(form.plazoMeses, 1, 120);
    const rows = amortData.slice(0, meses).map((r) => ({
      ...r,
      SI: r.SI * scale,
      interes: r.interes * scale,
      amortizacion: r.amortizacion * scale,
    }));

    const rentaMensualAmort =
      rows.length > 0 ? rows[0]!.interes + rows[0]!.amortizacion : 0;
    const rentaMensual = rentaMensualAmort > 0 ? rentaMensualAmort : form.rentaMensual;
    const sumaRentas = rows.reduce(
      (acc, r) => acc + r.interes + r.amortizacion,
      0,
    );

    const deposito = rentaMensual * form.depositoMesesRenta;
    const rentaConIva = rentaMensual * (1 + ivaRate);

    const comisionApertura = (valorBienSinIva * form.comisionAperturaPct) / 100;
    const residualFromTable =
      amortData.length > meses ? amortData[meses]!.SI * scale : 0;
    const valorResidual =
      residualFromTable > 0
        ? residualFromTable
        : (valorBienSinIva * form.valorResidualPct) / 100;

    const mkConcept = (concepto: string, base: number, aplicaIva = true) => {
      const iva = aplicaIva ? base * ivaRate : 0;
      return {
        concepto,
        importe: base,
        iva,
        total: base + iva,
      } satisfies ConceptRow;
    };

    const pagoInicialImporte = form.ratificacion + comisionApertura + deposito;
    const pagoInicialIva = (form.ratificacion + comisionApertura) * ivaRate;
    const pagoInicialTotal = pagoInicialImporte + pagoInicialIva;

    const mensual: MonthlyRow[] = [
      {
        mes: 0,
        saldoInicial: null,
        interes: 0,
        amortizacion: 0,
        rentaBase: 0,
        ivaRenta: 0,
        rentaTotal: 0,
        seguroBase: 0,
        ivaSeguro: 0,
        seguroTotal: 0,
        gpsBase: 0,
        ivaGps: 0,
        gpsTotal: 0,
        totalMes: pagoInicialTotal,
      },
      ...rows.map((r) => {
        const rentaBase = r.interes + r.amortizacion;
        const ivaRenta = rentaBase * ivaRate;
        const rentaTotal = rentaBase + ivaRenta;

        const seguroBase = form.seguroMensual;
        const ivaSeguro = seguroBase * ivaRate;
        const seguroTotal = seguroBase + ivaSeguro;

        const gpsBase = form.gpsMensual;
        const ivaGps = gpsBase * ivaRate;
        const gpsTotal = gpsBase + ivaGps;

        const totalMes = rentaTotal + seguroTotal + gpsTotal;

        return {
          mes: r.periodo,
          saldoInicial: r.SI,
          interes: r.interes,
          amortizacion: r.amortizacion,
          rentaBase,
          ivaRenta,
          rentaTotal,
          seguroBase,
          ivaSeguro,
          seguroTotal,
          gpsBase,
          ivaGps,
          gpsTotal,
          totalMes,
        } satisfies MonthlyRow;
      }),
    ];

    const conceptos: ConceptRow[] = [
      {
        concepto: "Pago inicial",
        importe: pagoInicialImporte,
        iva: pagoInicialIva,
        total: pagoInicialTotal,
      },
      mkConcept(
        `Rentas mensuales (${form.plazoMeses} meses)`,
        sumaRentas,
        true,
      ),
      mkConcept("Seguro", form.seguroMensual * form.plazoMeses, true),
      mkConcept("GPS", form.gpsMensual * form.plazoMeses, true),
      mkConcept("Pago por compra (valor residual)", valorResidual, true),
      {
        concepto: "Devolución de depósito",
        importe: -deposito,
        iva: 0,
        total: -deposito,
      },
    ];

    const totales = conceptos.reduce(
      (acc, r) => {
        acc.importe += r.importe;
        acc.iva += r.iva;
        acc.total += r.total;
        return acc;
      },
      { importe: 0, iva: 0, total: 0 },
    );

    const totalContrato = totales.total;
    const totalAnualizado = totalContrato / Math.max(1, form.plazoMeses / 12);
    const rentabilidadEconomica =
      valorBienSinIva > 0 ? totalContrato / valorBienSinIva - 1 : 0;

    return {
      ivaRate,
      tasaImplicitaPct,
      ivaBien,
      valorBienSinIva,
      valorConIva,
      deposito,
      rentaConIva,
      comisionApertura,
      valorResidual,
      rentaMensual,
      pagoInicialImporte,
      pagoInicialIva,
      pagoInicialTotal,
      mensual,
      conceptos,
      totales,
      totalContrato,
      totalAnualizado,
      rentabilidadEconomica,
    };
  }, [form]);

  const exportar = () => {
    const payload = {
      version: 1,
      generatedAt: new Date().toISOString(),
      input: form,
      derived: {
        ivaBien: derived.ivaBien,
        valorConIva: derived.valorConIva,
        valorBienSinIva: derived.valorBienSinIva,
        deposito: derived.deposito,
        rentaConIva: derived.rentaConIva,
        comisionApertura: derived.comisionApertura,
        valorResidual: derived.valorResidual,
        rentaMensual: derived.rentaMensual,
        tasaImplicitaPct: derived.tasaImplicitaPct,
        ratificacion: form.ratificacion,
        pagoInicial: {
          importe: derived.pagoInicialImporte,
          iva: derived.pagoInicialIva,
          total: derived.pagoInicialTotal,
        },
        totales: derived.totales,
        totalContrato: derived.totalContrato,
        totalAnualizado: derived.totalAnualizado,
        rentabilidadEconomica: derived.rentabilidadEconomica,
      },
      conceptos: derived.conceptos,
    };
    downloadJson(
      `cotizacion-${new Date().toISOString().slice(0, 10)}.json`,
      payload,
    );
  };

  const guardar = () => {
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      input: form,
    };
    localStorage.setItem("arrendacrece:lastQuote", JSON.stringify(payload));
    setLastSavedAt(payload.savedAt);
  };

  const restablecer = () => {
    setForm(initial);
    setLastSavedAt(null);
  };

  return (
    <div className="min-h-full bg-background font-sans">
      <div className="mx-auto w-full max-w-7xl px-6 py-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-600 font-extrabold text-white shadow-sm">
              AC
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-slate-900">
                Cotizador de Arrendamiento Puro
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Arrenda Crece · Plataforma financiera
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
            <Button onClick={restablecer}>Restablecer</Button>
            <Button onClick={exportar}>Exportar JSON</Button>
            <Button onClick={() => {}}>Recalcular</Button>
            <Button variant="primary" onClick={guardar}>
              Guardar cotización
            </Button>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <section className={`${cardClassName("white")} p-6`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-extrabold text-slate-800">
                    01. Datos generales
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    Información del cliente y del bien a arrendar
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Cliente"
                  value={form.cliente}
                  onChange={(v) => setForm((p) => ({ ...p, cliente: v }))}
                />
                <Input
                  label="Descripción del bien"
                  value={form.descripcionBien}
                  onChange={(v) => setForm((p) => ({ ...p, descripcionBien: v }))}
                />
                <Input
                  label="Valor del bien con IVA (MXN)"
                  value={String(form.valorBienConIva)}
                  inputMode="decimal"
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      valorBienConIva: Math.max(0, toNumber(v)),
                    }))
                  }
                />
                <Input
                  label="% IVA (%)"
                  value={String(form.ivaPct)}
                  inputMode="decimal"
                  suffix="%"
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      ivaPct: clampNumber(toNumber(v), 0, 30),
                    }))
                  }
                />
                <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                  <div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                    IVA del bien
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">
                    {mxn.format(derived.ivaBien)}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                  <div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                    Valor del bien sin IVA
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">
                    {mxn.format(derived.valorBienSinIva)}
                  </div>
                </div>
              </div>
            </section>

            <section className={`${cardClassName("white")} mt-6 p-6`}>
              <div>
                <div className="text-sm font-extrabold text-slate-800">
                  02. Parámetros financieros
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-500">
                  Tasas, plazo, rentas y conceptos asociados
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  label="Tasa efectiva (%)"
                  value={String(form.tasaEfectivaPct)}
                  inputMode="decimal"
                  suffix="%"
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      tasaEfectivaPct: clampNumber(toNumber(v), 0, 200),
                    }))
                  }
                />
                <Input
                  label="Tasa implícita (%)"
                  value={String(Math.round(derived.tasaImplicitaPct * 100) / 100)}
                  inputMode="decimal"
                  suffix="%"
                  readOnly
                  onChange={() => {}}
                />
                <Input
                  label="Plazo (meses)"
                  value={String(form.plazoMeses)}
                  inputMode="numeric"
                  selectOnFocus
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      plazoMeses: clampNumber(Math.round(toNumber(v)), 1, 120),
                    }))
                  }
                />

                <Input
                  label="Renta mensual (MXN)"
                  value={String(Math.round(derived.rentaMensual * 100) / 100)}
                  inputMode="decimal"
                  readOnly
                  onChange={() => {}}
                />
                <Input
                  label="Ratificación (MXN)"
                  value={String(form.ratificacion)}
                  inputMode="decimal"
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      ratificacion: Math.max(0, toNumber(v)),
                    }))
                  }
                />
                <Input
                  label="Pago inicial (MXN)"
                  value={String(Math.round(derived.pagoInicialTotal * 100) / 100)}
                  inputMode="decimal"
                  readOnly
                  onChange={() => {}}
                />
                <Input
                  label="Valor residual (%)"
                  value={String(form.valorResidualPct)}
                  inputMode="decimal"
                  suffix="%"
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      valorResidualPct: clampNumber(toNumber(v), 0, 100),
                    }))
                  }
                />

                <Input
                  label="Depósito (meses renta sin IVA)"
                  value={String(form.depositoMesesRenta)}
                  inputMode="numeric"
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      depositoMesesRenta: clampNumber(
                        Math.round(toNumber(v)),
                        0,
                        12,
                      ),
                    }))
                  }
                />
                <Input
                  label="Comisión apertura (%)"
                  value={String(form.comisionAperturaPct)}
                  inputMode="decimal"
                  suffix="%"
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      comisionAperturaPct: clampNumber(toNumber(v), 0, 50),
                    }))
                  }
                />
                <Input
                  label="Seguro mensual (MXN)"
                  value={String(form.seguroMensual)}
                  inputMode="decimal"
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      seguroMensual: Math.max(0, toNumber(v)),
                    }))
                  }
                />

                <Input
                  label="GPS mensual (MXN)"
                  value={String(form.gpsMensual)}
                  inputMode="decimal"
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      gpsMensual: Math.max(0, toNumber(v)),
                    }))
                  }
                />
              </div>
            </section>
          </div>

          <aside className="lg:col-span-5">
            <section className={`${cardClassName("blue")} p-6`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-extrabold tracking-tight">
                    04. Resumen financiero
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-extrabold tracking-[0.28em] text-white/70">
                    ARRENDA CRECE
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/70">
                    Total contrato
                  </div>
                  <div className="mt-2 text-lg font-extrabold">
                    {mxn.format(derived.totalContrato)}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/70">
                    Total anualizado
                  </div>
                  <div className="mt-2 text-lg font-extrabold">
                    {mxn.format(derived.totalAnualizado)}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/70">
                    Rentabilidad económica
                  </div>
                  <div className="mt-2 text-lg font-extrabold">
                    {pct.format(derived.rentabilidadEconomica)}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/70">
                    Tasa efectiva
                  </div>
                  <div className="mt-2 text-lg font-extrabold">
                    {pct.format(form.tasaEfectivaPct / 100)}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/70">
                    Tasa implícita
                  </div>
                  <div className="mt-2 text-lg font-extrabold">
                    {pct.format(derived.tasaImplicitaPct / 100)}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/70">
                    Comisión apertura
                  </div>
                  <div className="mt-2 text-lg font-extrabold">
                    {mxn.format(derived.comisionApertura)}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-3">
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/70">
                    Renta c/IVA
                  </div>
                  <div className="mt-2 text-sm font-extrabold">
                    {mxn.format(derived.rentaConIva)}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/70">
                    Depósito
                  </div>
                  <div className="mt-2 text-sm font-extrabold">
                    {mxn.format(derived.deposito)}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/70">
                    Valor residual
                  </div>
                  <div className="mt-2 text-sm font-extrabold">
                    {mxn.format(derived.valorResidual)}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/70">
                    IVA del bien
                  </div>
                  <div className="mt-2 text-sm font-extrabold">
                    {mxn.format(derived.ivaBien)}
                  </div>
                </div>
              </div>

              {lastSavedAt ? (
                <div className="mt-4 text-xs font-semibold text-white/70">
                  Guardado:{" "}
                  <span className="font-extrabold text-white">
                    {new Date(lastSavedAt).toLocaleString("es-MX")}
                  </span>
                </div>
              ) : null}
            </section>
          </aside>
        </div>

        <section className={`${cardClassName("white")} mt-6 overflow-hidden`}>
          <div className="p-6">
            <div className="text-sm font-extrabold text-slate-800">
              03. Tabla de conceptos
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-500">
              Desglose calculado en tiempo real
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-6 py-4 text-left text-xs font-extrabold">
                    Concepto
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-extrabold">
                    Importe
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-extrabold">
                    IVA
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-extrabold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {derived.conceptos.map((r) => (
                  <tr
                    key={r.concepto}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {r.concepto}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                      {mxn.format(r.importe)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-500">
                      {mxn.format(r.iva)}
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-sm font-extrabold ${
                        r.total < 0 ? "text-rose-600" : "text-slate-800"
                      }`}
                    >
                      {mxn.format(r.total)}
                    </td>
                  </tr>
                ))}

                <tr className="bg-slate-50">
                  <td className="px-6 py-4 text-sm font-extrabold text-slate-900">
                    Totales
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-extrabold text-slate-900">
                    {mxn.format(derived.totales.importe)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-extrabold text-slate-900">
                    {mxn.format(derived.totales.iva)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-extrabold text-sky-700">
                    {mxn.format(derived.totales.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
