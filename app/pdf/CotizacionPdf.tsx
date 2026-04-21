import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ReactElement } from "react";

/* eslint-disable jsx-a11y/alt-text */

type QuoteInput = {
  cliente: string;
  descripcionBien: string;
  valorBienConIva: number;
  ivaPct: number;
  tasaEfectivaPct: number;
  tasaImplicitaPct: number;
  plazoMeses: number;
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

type Derived = {
  valorBienSinIva: number;
  ivaBien: number;
  totalContrato: number;
  totalAnualizado: number;
  rentabilidadEconomica: number;
  rentaMensual: number;
  rentaConIva: number;
  deposito: number;
  valorResidual: number;
  comisionApertura: number;
  ivaComisionApertura: number;
  comisionAperturaConIva: number;
  pagoInicialTotal: number;
  conceptos: ConceptRow[];
};

// ── PALETTE ─────────────────────────────────────────────────────
const NAVY       = "#0B2545";
const NAVY_MID   = "#1B4A87";
const GOLD       = "#C9A84C";
const GOLD_PALE  = "#F5EDD9";
const BG_STRIPE  = "#EBF1FA";
const WHITE      = "#FFFFFF";
const TEXT_DESC  = "#3D5A80";
const TEXT_NOTE  = "#607B96";
const RED_NEG    = "#B91C1C";
const BORDER     = "#C5D8EE";
const PAGE_BG    = "#F7FAFD";

// horizontal padding for all content sections
const CP = 26;

// Cabecera PDF: ancho del banner en pt (Yoga + Image no resuelven bien width: "100%" aquí).
const PDF_PAGE_W_PT = 595.28;
const HEADER_INNER_W = PDF_PAGE_W_PT - CP * 2;
const HEADER_DATE_RESERVE_W = 188;
const HEADER_BANNER_W = Math.max(
  200,
  Math.floor(HEADER_INNER_W - 56 - 14 * 2 - HEADER_DATE_RESERVE_W),
);

// column widths for integration table (531 pt usable inside content)
const COL_HASH      = 28;
const COL_CONCEPTO  = 175;
const COL_IMPORTES  = 108;
const COL_IVA       = 105;
const COL_TOTAL     = 115;

// detail table columns
const COL_LEFT  = 148;
const COL_MID   = 130;
// descCell: 531 - 148 - 130 = 253

const S = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    fontSize: 7.5,
    fontFamily: "Helvetica",
    backgroundColor: PAGE_BG,
    color: NAVY,
  },

  // ── TOP ACCENT ──────────────────────────────────────────────
  topAccent: { height: 4, backgroundColor: GOLD },

  // ── HEADER BAND ─────────────────────────────────────────────
  headerBand: {
    backgroundColor: WHITE,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: CP,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flexGrow: 1,
    flexShrink: 0,
    marginRight: 14,
  },
  logo: { width: 56, height: 56, objectFit: "contain", flexShrink: 0 },
  bannerWrap: {
    width: HEADER_BANNER_W,
    height: 56,
    justifyContent: "center",
  },
  banner: {
    width: HEADER_BANNER_W,
    height: 56,
    objectFit: "contain",
    objectPosition: "left",
  },
  headerRight: { alignItems: "flex-end", flexShrink: 0 },
  dateLabel: {
    fontSize: 6,
    color: NAVY_MID,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  dateValue: { fontSize: 7, color: NAVY, marginTop: 2, textAlign: "right" },

  // ── GOLD LINE ───────────────────────────────────────────────
  goldLine: { height: 2, backgroundColor: GOLD },

  // ── QUOTE TITLE BAND ────────────────────────────────────────
  titleBand: {
    backgroundColor: NAVY_MID,
    paddingVertical: 4,
    paddingHorizontal: CP,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 9,
    fontWeight: 700,
    color: WHITE,
    letterSpacing: 2.1,
    textAlign: "center",
    textTransform: "uppercase",
  },

  // ── CONTENT AREA ────────────────────────────────────────────
  content: { paddingHorizontal: CP, paddingTop: 7, paddingBottom: 0 },

  // ── CLIENT CARD ─────────────────────────────────────────────
  clientCard: {
    backgroundColor: WHITE,
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientLeft: { flexShrink: 1, minWidth: 0 },
  clientSmallLabel: {
    fontSize: 6.5,
    color: TEXT_NOTE,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  clientName: {
    fontSize: 10.5,
    fontWeight: 700,
    color: NAVY,
    marginTop: 2,
  },
  clientSub: {
    fontSize: 6.8,
    color: TEXT_DESC,
    marginTop: 2,
    fontStyle: "italic",
    lineHeight: 1.35,
  },
  clientBadge: {
    backgroundColor: NAVY,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: "center",
    flexShrink: 0,
    marginLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: GOLD,
  },
  clientBadgeText: {
    fontSize: 6.3,
    color: GOLD,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  // ── INTEGRATION TABLE ────────────────────────────────────────
  tableWrap: {
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    marginBottom: 2,
  },
  tableTitleBar: {
    backgroundColor: NAVY,
    paddingVertical: 4,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  tableTitleAccent: {
    width: 3,
    height: 14,
    backgroundColor: GOLD,
    marginRight: 9,
  },
  tableTitleText: {
    fontSize: 7,
    fontWeight: 700,
    color: WHITE,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    flexGrow: 1,
  },
  tableTitleDeco: {
    width: 28,
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.6,
  },
  integSubHeader: {
    flexDirection: "row",
    backgroundColor: NAVY_MID,
    borderTopWidth: 1,
    borderTopColor: GOLD,
    borderBottomWidth: 1,
    borderBottomColor: NAVY,
  },
  integSubHeaderCell: {
    color: WHITE,
    fontSize: 6.3,
    fontWeight: 700,
    textAlign: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  integRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  integCell: {
    fontSize: 7.4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    textAlign: "center",
    color: NAVY,
  },
  integCellBold: {
    fontSize: 7.4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    textAlign: "center",
    color: NAVY_MID,
    fontWeight: 700,
  },
  integCellRed: {
    fontSize: 7.4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    textAlign: "center",
    color: RED_NEG,
    fontWeight: 700,
  },
  integSep: {
    height: 3,
    backgroundColor: BG_STRIPE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  integNote: {
    fontSize: 6,
    color: TEXT_NOTE,
    fontStyle: "italic",
    textAlign: "right",
    marginBottom: 5,
    paddingRight: 1,
  },

  // ── DETAIL TABLE ────────────────────────────────────────────
  detailRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  leftCell: {
    width: COL_LEFT,
    backgroundColor: NAVY,
    paddingVertical: 5,
    paddingHorizontal: 10,
    justifyContent: "center",
    borderRightWidth: 2,
    borderRightColor: GOLD,
  },
  midCell: {
    width: COL_MID,
    backgroundColor: BG_STRIPE,
    paddingVertical: 5,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  descCell: {
    width: 253,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: WHITE,
    justifyContent: "center",
  },
  labelText: {
    fontSize: 6.6,
    fontWeight: 700,
    color: GOLD,
    letterSpacing: 0.2,
  },
  valueText: {
    fontSize: 7.5,
    fontWeight: 700,
    color: NAVY,
  },
  descText: {
    fontSize: 6.1,
    color: TEXT_DESC,
    lineHeight: 1.32,
  },

  // ── FOOTNOTE BOX ────────────────────────────────────────────
  footNoteBox: {
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: GOLD_PALE,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    marginBottom: 6,
  },
  footNoteText: {
    fontSize: 6.2,
    color: TEXT_DESC,
    fontStyle: "italic",
    lineHeight: 1.4,
  },

  // ── FOOTER BAND ─────────────────────────────────────────────
  footerBand: {
    backgroundColor: NAVY,
    paddingVertical: 6,
    paddingHorizontal: CP,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerWebsite: {
    fontSize: 14,
    fontWeight: 700,
    color: GOLD,
  },
  footerRight: { alignItems: "flex-end" },
  footerPhone: {
    fontSize: 7.5,
    color: WHITE,
    fontWeight: 700,
  },
  footerUnderline: {
    height: 1,
    backgroundColor: GOLD,
    width: 200,
    marginTop: 3,
    alignSelf: "flex-end",
  },
  footerAddress: {
    fontSize: 6,
    color: "#7EA8CC",
    marginTop: 3,
    textAlign: "right",
  },
});

function mxn(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function num(n: number) {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

type IntegRow = {
  hash: string;
  concepto: string;
  importe: number | null;
  iva: number | null;
  total: number | null;
  isNegative?: boolean;
  isSeparator?: boolean;
};

export function CotizacionPdfDocument({
  form,
  derived,
  logoDataUrl,
  headerDataUrl,
}: {
  form: QuoteInput;
  derived: Derived;
  logoDataUrl: string;
  headerDataUrl: string;
}): ReactElement {
  Font.registerHyphenationCallback((word) => {
    if (word.length <= 14) return [word];
    const parts: string[] = [];
    for (let i = 0; i < word.length; i += 14) parts.push(word.slice(i, i + 14));
    return parts;
  });

  const dateStr = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const ivaPct = form.ivaPct / 100;

  const pagoInicialImporte =
    derived.comisionApertura + derived.deposito + form.ratificacion;
  const pagoInicialIva = derived.ivaComisionApertura;
  const pagoInicialTotal = pagoInicialImporte + pagoInicialIva;

  const rentaIva   = derived.rentaMensual * ivaPct;
  const rentaTotal = derived.rentaMensual + rentaIva;

  const seguroIva   = form.seguroMensual * ivaPct;
  const seguroTotal = form.seguroMensual + seguroIva;

  const gpsIva   = form.gpsMensual * ivaPct;
  const gpsTotal = form.gpsMensual + gpsIva;

  const vrIva   = derived.valorResidual * ivaPct;
  const vrTotal = derived.valorResidual + vrIva;

  const integRows: IntegRow[] = [
    {
      hash: "1",
      concepto: "Pago Inicial (sin IVA)",
      importe: pagoInicialImporte,
      iva: pagoInicialIva,
      total: pagoInicialTotal,
    },
    {
      hash: String(form.plazoMeses),
      concepto: "Renta Mensual (sin IVA)",
      importe: derived.rentaMensual,
      iva: rentaIva,
      total: rentaTotal,
    },
    {
      hash: "",
      concepto: "Póliza de Seguro Mensual (sin IVA)",
      importe: form.seguroMensual,
      iva: seguroIva,
      total: seguroTotal,
    },
    {
      hash: String(form.plazoMeses),
      concepto: "Equipo GPS (sin IVA)",
      importe: form.gpsMensual,
      iva: gpsIva,
      total: gpsTotal,
    },
    { hash: "", concepto: "", importe: null, iva: null, total: null, isSeparator: true },
    {
      hash: "1",
      concepto: "Devolución Depósito (sin IVA)",
      importe: -derived.deposito,
      iva: null,
      total: -derived.deposito,
      isNegative: true,
    },
    { hash: "", concepto: "", importe: null, iva: null, total: null, isSeparator: true },
    {
      hash: "1",
      concepto: "Pago por Compra (sin IVA)",
      importe: derived.valorResidual,
      iva: vrIva,
      total: vrTotal,
    },
  ];

  const detailRows = [
    {
      label: "SOLICITANTE:",
      mid: form.cliente || "—",
      desc: "",
    },
    {
      label: "DESCRIPCIÓN DEL ACTIVO:",
      mid: form.descripcionBien || "—",
      desc: "",
    },
    {
      label: "VALOR ACTIVO\n(IVA INCLUIDO):",
      mid: mxn(form.valorBienConIva),
      desc: "Precio del activo elegido por el cliente, de acuerdo a factura emitida por el proveedor. El precio mencionado podría reducirse en caso de anticipo.",
    },
    {
      label: "APERTURA DE CRÉDITO\n(SIN IVA):",
      mid: `${form.comisionAperturaPct.toFixed(2)}%\n${mxn(derived.comisionApertura)}`,
      desc: "Comisión de apertura pagadera al inicio de la operación (el importe NO incluye IVA).",
    },
    {
      label: "PLAZO:",
      mid: `${form.plazoMeses}\nMESES`,
      desc: "Plazo durante el que se otorga el uso del equipo arrendado, bajo condiciones mencionadas en contrato.",
    },
    {
      label: "RENTA MENSUAL FIJA\n(SIN IVA):",
      mid: mxn(derived.rentaMensual),
      desc: "Cantidad monetaria correspondiente a los pagos a realizar durante el plazo establecido (el importe NO incluye IVA).",
    },
    {
      label: "DEPÓSITO EN GARANTÍA\n(SIN IVA):",
      mid: mxn(derived.deposito),
      desc: "Cantidad monetaria por concepto de garantía por cualquier daño o deuda relativa referente al activo en arrendamiento. Este importe será devuelto íntegramente al arrendatario una vez concluido el plazo acordado siempre y cuando se hayan cumplido todas las obligaciones en contrato.",
    },
    {
      label: "VALOR RESIDUAL\n(SIN IVA):",
      mid: `${form.valorResidualPct.toFixed(2)}%\n${mxn(derived.valorResidual)}`,
      desc: "Cantidad monetaria estimada del valor del activo arrendado en el mercado al término del plazo contratado (el importe NO incluye IVA).",
    },
    {
      label: "SEGUROS\n(SIN IVA):",
      mid: mxn(form.seguroMensual),
      desc: "Serán por cuenta exclusiva del arrendatario el estado (daños, destrucción, pérdida, riesgos, robo o cualquier índole en general) que sufra el equipo arrendado, por lo que se deberá contar con un seguro amplio (siendo beneficiaria la arrendadora), durante la totalidad del plazo del arrendamiento (importe SIN IVA).",
    },
    {
      label: "RATIFICACIÓN DE\nCONTRATO (SIN IVA):",
      mid: mxn(form.ratificacion),
      desc: "Gasto de ratificación de las firmas en contratos, por fedatario público (el importe NO incluye IVA).",
    },
    {
      label: "EQUIPO GPS\n(SIN IVA):",
      mid: mxn(form.gpsMensual),
      desc: "Cantidad monetaria correspondiente a los pagos a realizar durante el plazo establecido por renta de equipo de GPS (el importe NO incluye IVA).",
    },
    {
      label: "DERECHO PREFERENTE:",
      mid: form.cliente || "—",
      desc: "El arrendatario tendrá derecho preferente para adquirir, en su valor de mercado, el activo arrendado mediante: 1) Pago al contado; 2) Firma de un contrato de compra-venta a plazos ó 3) Firma de un nuevo contrato de arrendamiento, siempre y cuando el plazo arrendado haya concluido y el arrendatario se encuentre al corriente en el cumplimiento de todas sus obligaciones en contrato.",
    },
  ];

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* ── TOP GOLD ACCENT ── */}
        <View style={S.topAccent} />

        {/* ── HEADER BAND ── */}
        <View style={S.headerBand}>
          <View style={S.headerLeft}>
            <Image src={logoDataUrl} style={S.logo} />
            <View style={S.bannerWrap}>
              <Image src={headerDataUrl} style={S.banner} />
            </View>
          </View>
          <View style={S.headerRight}>
            <Text style={S.dateLabel}>Fecha de emisión</Text>
            <Text style={S.dateValue}>{dateStr}</Text>
          </View>
        </View>

        {/* ── GOLD LINE ── */}
        <View style={S.goldLine} />

        {/* ── QUOTE TITLE ── */}
        <View style={S.titleBand}>
          <Text style={S.titleText}>Cotización de Arrendamiento Puro</Text>
        </View>

        {/* ── CONTENT ── */}
        <View style={S.content}>

          {/* CLIENT CARD */}
          <View style={S.clientCard}>
            <View style={S.clientLeft}>
              <Text style={S.clientSmallLabel}>Propuesta para:</Text>
              <Text style={S.clientName}>{form.cliente || "—"}</Text>
              <Text style={S.clientSub}>
                Esperando se encuentre bien, le anexamos la presente propuesta para arrendamiento puro.
              </Text>
            </View>
            <View style={S.clientBadge}>
              <Text style={S.clientBadgeText}>ARRENDAMIENTO</Text>
              <Text style={[S.clientBadgeText, { marginTop: 2 }]}>PURO</Text>
            </View>
          </View>

          {/* ── INTEGRATION TABLE ── */}
          <View style={S.tableWrap}>
            {/* Title row */}
            <View style={S.tableTitleBar}>
              <View style={S.tableTitleAccent} />
              <Text style={S.tableTitleText}>Integración del Arrendamiento</Text>
              <View style={S.tableTitleDeco} />
            </View>

            {/* Column headers */}
            <View style={S.integSubHeader}>
              <Text style={[S.integSubHeaderCell, { width: COL_HASH }]}>#</Text>
              <Text style={[S.integSubHeaderCell, { width: COL_CONCEPTO }]}>Concepto</Text>
              <Text style={[S.integSubHeaderCell, { width: COL_IMPORTES }]}>Importe (sin IVA)</Text>
              <Text style={[S.integSubHeaderCell, { width: COL_IVA }]}>IVA</Text>
              <Text style={[S.integSubHeaderCell, { width: COL_TOTAL }]}>Total (con IVA)</Text>
            </View>

            {/* Data rows */}
            {integRows.map((r, idx) => {
              if (r.isSeparator) {
                return <View key={idx} style={S.integSep} />;
              }
              const cell     = r.isNegative ? S.integCellRed : S.integCell;
              const hashCell = r.isNegative ? S.integCellRed : S.integCellBold;
              return (
                <View
                  key={idx}
                  style={[
                    S.integRow,
                    { backgroundColor: idx % 2 === 0 ? BG_STRIPE : WHITE },
                  ]}
                >
                  <Text style={[hashCell, { width: COL_HASH }]}>{r.hash}</Text>
                  <Text style={[cell, { width: COL_CONCEPTO, textAlign: "center" }]}>
                    {r.concepto}
                  </Text>
                  <Text style={[cell, { width: COL_IMPORTES }]}>
                    {r.importe !== null
                      ? r.isNegative
                        ? "-" + num(Math.abs(r.importe))
                        : num(r.importe)
                      : ""}
                  </Text>
                  <Text style={[cell, { width: COL_IVA }]}>
                    {r.iva !== null ? num(r.iva) : ""}
                  </Text>
                  <Text style={[cell, { width: COL_TOTAL }]}>
                    {r.total !== null
                      ? r.isNegative
                        ? "-" + num(Math.abs(r.total))
                        : num(r.total)
                      : ""}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={S.integNote}>
            * El monto total del Pago Inicial no considera montos por concepto de anticipos.
          </Text>

          {/* ── DETAIL TABLE ── */}
          <View style={S.tableWrap}>
            {/* Title row */}
            <View style={S.tableTitleBar}>
              <View style={S.tableTitleAccent} />
              <Text style={S.tableTitleText}>Condiciones del Arrendamiento</Text>
              <View style={S.tableTitleDeco} />
            </View>

            {detailRows.map((r, idx) => (
              <View
                key={r.label}
                style={[S.detailRow, idx === 0 ? { borderTopWidth: 0 } : {}]}
              >
                <View style={S.leftCell}>
                  {r.label.split("\n").map((line, i) => (
                    <Text key={i} style={S.labelText}>{line}</Text>
                  ))}
                </View>
                <View style={S.midCell}>
                  {String(r.mid).split("\n").map((line, i) => (
                    <Text key={i} style={S.valueText}>{line}</Text>
                  ))}
                </View>
                <View style={S.descCell}>
                  <Text style={S.descText}>{r.desc || " "}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── FOOTNOTES ── */}
          <View style={S.footNoteBox}>
            <Text style={S.footNoteText}>
              * En equipos de transporte, las placas y tenencia vehicular van por cuenta del cliente.{"\n"}
              * Esta cotización está sujeta a su aprobación y los importes pueden variar sin previo aviso.
            </Text>
          </View>

        </View>

        {/* Spacer to push footer down */}
        <View style={{ flexGrow: 1 }} />

        {/* ── FOOTER BAND ── */}
        <View style={S.footerBand}>
          <Text style={S.footerWebsite}>arrendacrece.com</Text>
          <View style={S.footerRight}>
            <Text style={S.footerPhone}>WhatsApp  +52 (33) 1840 0000</Text>
            <View style={S.footerUnderline} />
            <Text style={S.footerAddress}>
              Efraín González Luna 2594, Col. Arcos Sur, C.P. 44130, Guadalajara, Jal., MX
            </Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
