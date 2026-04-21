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

const BLUE_DARK = "#0b3b77";
const BLUE_BG = "#d8e6f6";
const BLUE_HEADER = "#0b1220";
const WHITE = "#ffffff";
const RED = "#c0392b";

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  row: { flexDirection: "row" },
  header: { flexDirection: "row", justifyContent: "space-between" },
  brandLeft: { flexDirection: "row", gap: 10, alignItems: "center" },
  logo: { width: 58, height: 58 },
  topRight: { alignItems: "flex-end" },
  iconsRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  iconBox: {
    width: 14,
    height: 10,
    borderWidth: 1,
    borderColor: BLUE_DARK,
    borderRadius: 2,
  },
  motto: {
    marginTop: 6,
    fontSize: 10,
    fontStyle: "italic",
    fontWeight: 700,
    color: BLUE_DARK,
  },
  dateRight: { marginTop: 10, fontSize: 9, color: BLUE_DARK },
  helloBlock: { marginTop: 10 },
  helloName: { fontSize: 10, fontWeight: 700, color: BLUE_DARK },
  helloText: { marginTop: 2, fontSize: 9, color: BLUE_DARK },

  // ── INTEGRATION TABLE ──────────────────────────────────────────
  integTitle: {
    backgroundColor: BLUE_HEADER,
    color: WHITE,
    textAlign: "center",
    fontSize: 10,
    fontWeight: 700,
    paddingVertical: 5,
  },
  integHeaderRow: {
    flexDirection: "row",
    backgroundColor: BLUE_DARK,
  },
  integHeaderCell: {
    color: WHITE,
    fontSize: 8.5,
    fontWeight: 700,
    textAlign: "center",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  integDataRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BLUE_DARK,
  },
  integCell: {
    fontSize: 8.5,
    paddingVertical: 5,
    paddingHorizontal: 4,
    textAlign: "center",
    color: BLUE_DARK,
  },
  integCellBold: {
    fontSize: 8.5,
    paddingVertical: 5,
    paddingHorizontal: 4,
    textAlign: "center",
    color: BLUE_DARK,
    fontWeight: 700,
  },
  integRedCell: {
    fontSize: 8.5,
    paddingVertical: 5,
    paddingHorizontal: 4,
    textAlign: "center",
    color: RED,
    fontWeight: 700,
  },
  integSeparator: {
    borderTopWidth: 4,
    borderTopColor: WHITE,
  },

  // column widths for integration table (total ~531 pt usable)
  colHash: { width: 30 },
  colConcepto: { width: 170 },
  colImportes: { width: 110 },
  colIva: { width: 110 },
  colTotal: { width: 111 },

  integNote: {
    fontSize: 7.5,
    color: BLUE_DARK,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 3,
  },

  // ── DETAIL TABLE ───────────────────────────────────────────────
  tableWrap: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: BLUE_DARK,
  },
  leftCell: {
    width: 190,
    backgroundColor: BLUE_BG,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: BLUE_DARK,
    justifyContent: "center",
  },
  midCell: {
    width: 140,
    backgroundColor: BLUE_BG,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: BLUE_DARK,
    justifyContent: "center",
    alignItems: "center",
  },
  descCell: {
    width: 201,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: WHITE,
    justifyContent: "center",
  },
  cellTextLabel: { fontSize: 8.5, fontWeight: 700, color: BLUE_DARK },
  cellTextValue: { fontSize: 8.5, fontWeight: 700, color: BLUE_DARK },
  descText: { fontSize: 7.6, color: BLUE_DARK, lineHeight: 1.2 },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: BLUE_DARK,
  },

  footNote: {
    marginTop: 10,
    fontSize: 8,
    color: BLUE_DARK,
    textAlign: "center",
    fontStyle: "italic",
  },
  bottomBar: {
    marginTop: 10,
    backgroundColor: BLUE_DARK,
    color: WHITE,
    paddingVertical: 10,
    textAlign: "center",
    fontSize: 16,
    fontWeight: 700,
  },
  bottomBold: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 12,
    fontWeight: 700,
    color: BLUE_DARK,
  },
  bottomSmall: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 8,
    color: BLUE_DARK,
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
}: {
  form: QuoteInput;
  derived: Derived;
  logoDataUrl: string;
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

  // IVA rate from form
  const ivaPct = form.ivaPct / 100;

  // Pago inicial = comisión apertura con IVA + depósito + ratificación con IVA
  const pagoInicialImporte =
    derived.comisionApertura + derived.deposito + form.ratificacion;
  const pagoInicialIva = derived.ivaComisionApertura; // IVA on comision only
  const pagoInicialTotal = pagoInicialImporte + pagoInicialIva;

  // Renta mensual IVA
  const rentaIva = derived.rentaMensual * ivaPct;
  const rentaTotal = derived.rentaMensual + rentaIva;

  // Seguro
  const seguroIva = form.seguroMensual * ivaPct;
  const seguroTotal = form.seguroMensual + seguroIva;

  // GPS mensual
  const gpsIva = form.gpsMensual * ivaPct;
  const gpsTotal = form.gpsMensual + gpsIva;

  // Valor residual IVA (pago por compra)
  const vrIva = derived.valorResidual * ivaPct;
  const vrTotal = derived.valorResidual + vrIva;

  const integRows: IntegRow[] = [
    {
      hash: "1",
      concepto: "Pago Inicial",
      importe: pagoInicialImporte,
      iva: pagoInicialIva,
      total: pagoInicialTotal,
    },
    {
      hash: String(form.plazoMeses),
      concepto: "Renta Mensual",
      importe: derived.rentaMensual,
      iva: rentaIva,
      total: rentaTotal,
    },
    {
      hash: "",
      concepto: "Póliza de Seguro Mensual",
      importe: form.seguroMensual,
      iva: seguroIva,
      total: seguroTotal,
    },
    {
      hash: String(form.plazoMeses),
      concepto: "Equipo GPS",
      importe: form.gpsMensual,
      iva: gpsIva,
      total: gpsTotal,
    },
    { hash: "", concepto: "", importe: null, iva: null, total: null, isSeparator: true },
    {
      hash: "1",
      concepto: "Devolución Depósito en Garantía",
      importe: -derived.deposito,
      iva: null,
      total: -derived.deposito,
      isNegative: true,
    },
    { hash: "", concepto: "", importe: null, iva: null, total: null, isSeparator: true },
    {
      hash: "1",
      concepto: "Pago por Compra (estimado)",
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
      label: "VALOR ACTIVO (IVA\nINCLUIDO):",
      mid: mxn(form.valorBienConIva),
      desc: "Precio del activo elegido por el cliente, de acuerdo a factura emitida por el proveedor. El precio mencionado podría reducirse en caso de anticipo.",
    },
    {
      label: "APERTURA DE CRÉDITO:",
      mid: `${form.comisionAperturaPct.toFixed(2)}%\n${mxn(derived.comisionApertura)}`,
      desc: "Comisión de apertura pagadera al inicio de la operación (el importe NO incluye IVA).",
    },
    {
      label: "PLAZO:",
      mid: `${form.plazoMeses}\nMESES`,
      desc: "Plazo durante el que se otorga el uso del equipo arrendado, bajo condiciones mencionadas en contrato.",
    },
    {
      label: "RENTA MENSUAL FIJA:",
      mid: mxn(derived.rentaMensual),
      desc: "Cantidad monetaria correspondiente a los pagos a realizar durante el plazo establecido (el importe NO incluye IVA).",
    },
    {
      label: "DEPÓSITO EN GARANTÍA:",
      mid: mxn(derived.deposito),
      desc: "Cantidad monetaria por concepto de garantía por cualquier daño o deuda relativa referente al activo en arrendamiento. Este importe será devuelto íntegramente al arrendatario una vez concluido el plazo acordado siempre y cuando se hayan cumplido todas las obligaciones en contrato.",
    },
    {
      label: "VALOR RESIDUAL:",
      mid: `${form.valorResidualPct.toFixed(2)}%\n${mxn(derived.valorResidual)}`,
      desc: "Cantidad monetaria estimada del valor del activo arrendado en el mercado al término del plazo contratado (el importe NO incluye IVA).",
    },
    {
      label: "SEGUROS:",
      mid: mxn(form.seguroMensual),
      desc: "Serán por cuenta exclusiva del arrendatario el estado (daños, destrucción, pérdida, riesgos, robo o cualquier índole en general) que sufra el equipo arrendado, por lo que se deberá contar con un seguro amplio (siendo beneficiaria la arrendadora), durante la totalidad del plazo del arrendamiento.",
    },
    {
      label: "RATIFICACIÓN DE CONTRATO:",
      mid: mxn(form.ratificacion),
      desc: "Gasto de ratificación de las firmas en contratos, por fedatario público (el importe NO incluye IVA).",
    },
    {
      label: "EQUIPO GPS:",
      mid: mxn(form.gpsMensual),
      desc: "Cantidad monetaria correspondiente a los pagos a realizar durante el plazo establecido por renta de equipo de GPS (el importe NO incluye IVA).",
    },
    {
      label: "DERECHO PREFERENTE:",
      mid: form.cliente || "—",
      desc: "El arrendatario tendrá derecho preferente para adquirir, en su valor de mercado, el activo arrendado mediante: 1) Pago al contado; 2) Firma de un contrato de compra-venta a plazos ó 3) firma de un nuevo contrato de arrendamiento, siempre y cuando el plazo arrendado haya concluido y el arrendatario se encuentre al corriente en el cumplimiento de todas sus obligaciones en contrato.",
    },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.brandLeft}>
            <Image src={logoDataUrl} style={styles.logo} />
          </View>
          <View style={styles.topRight}>
            <View style={styles.iconsRow}>
              <View style={styles.iconBox} />
              <View style={styles.iconBox} />
              <View style={styles.iconBox} />
              <View style={styles.iconBox} />
              <View style={styles.iconBox} />
              <View style={styles.iconBox} />
            </View>
            <Text style={styles.motto}>"Impulsamos Empresas y Empresarios"</Text>
            <Text style={styles.dateRight}>{dateStr}</Text>
          </View>
        </View>

        {/* ── GREETING ── */}
        <View style={styles.helloBlock}>
          <Text style={styles.helloName}>{form.cliente || "—"}</Text>
          <Text style={styles.helloText}>
            Esperando se encuentre bien, le anexo propuesta para arrendamiento puro…
          </Text>
        </View>

        {/* ── INTEGRATION TABLE ── */}
        <View style={{ marginTop: 12, borderWidth: 1, borderColor: BLUE_DARK }}>
          {/* Title */}
          <Text style={styles.integTitle}>INTEGRACIÓN DEL ARRENDAMIENTO</Text>

          {/* Header row */}
          <View style={styles.integHeaderRow}>
            <Text style={[styles.integHeaderCell, styles.colHash]}>#</Text>
            <Text style={[styles.integHeaderCell, styles.colConcepto]}>CONCEPTOS</Text>
            <Text style={[styles.integHeaderCell, styles.colImportes]}>IMPORTES</Text>
            <Text style={[styles.integHeaderCell, styles.colIva]}>IVA</Text>
            <Text style={[styles.integHeaderCell, styles.colTotal]}>TOTAL</Text>
          </View>

          {/* Data rows */}
          {integRows.map((r, idx) => {
            if (r.isSeparator) {
              return (
                <View
                  key={idx}
                  style={[
                    styles.integDataRow,
                    { backgroundColor: "#f0f4fa", height: 4 },
                  ]}
                />
              );
            }
            const cellStyle = r.isNegative ? styles.integRedCell : styles.integCell;
            const hashCellStyle = r.isNegative ? styles.integRedCell : styles.integCellBold;
            return (
              <View
                key={idx}
                style={[
                  styles.integDataRow,
                  { backgroundColor: idx % 2 === 0 ? BLUE_BG : WHITE },
                ]}
              >
                <Text style={[hashCellStyle, styles.colHash]}>{r.hash}</Text>
                <Text
                  style={[
                    r.isNegative ? styles.integRedCell : styles.integCell,
                    styles.colConcepto,
                    { textAlign: "center" },
                  ]}
                >
                  {r.concepto}
                </Text>
                <Text style={[cellStyle, styles.colImportes]}>
                  {r.importe !== null
                    ? r.isNegative
                      ? "-" + num(Math.abs(r.importe))
                      : num(r.importe)
                    : ""}
                </Text>
                <Text style={[cellStyle, styles.colIva]}>
                  {r.iva !== null ? num(r.iva) : ""}
                </Text>
                <Text style={[cellStyle, styles.colTotal]}>
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

        {/* Integration note */}
        <Text style={styles.integNote}>
          *El monto total mencionado como Pago Inicial no considera montos por concepto de anticipos.
        </Text>

        {/* ── DETAIL TABLE ── */}
        <View style={styles.tableWrap}>
          {detailRows.map((r, idx) => (
            <View
              key={r.label}
              style={[styles.row, ...(idx === 0 ? [] : [styles.rowBorder])]}
            >
              <View style={styles.leftCell}>
                <Text style={styles.cellTextLabel} wrap>
                  {r.label}
                </Text>
              </View>
              <View style={styles.midCell}>
                {String(r.mid)
                  .split("\n")
                  .map((line, i) => (
                    <Text key={i} style={styles.cellTextValue} wrap>
                      {line}
                    </Text>
                  ))}
              </View>
              <View style={styles.descCell}>
                <Text style={styles.descText} wrap>
                  {r.desc || " "}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── FOOTNOTES ── */}
        <Text style={styles.footNote}>
          *En equipos de transporte, las placas y tenencia vehicular van por cuenta del
          cliente.{"\n"}
          *Esta cotización está sujeta a su aprobación y los importes pueden variar sin
          previo aviso.
        </Text>

        {/* ── FOOTER ── */}
        <Text style={styles.bottomBar}>arrendacrece.com</Text>
        <Text style={styles.bottomBold}>
          CUALQUIER DUDA ESCRÍBENOS POR WHATSAPP +52 (33) 1840 0000
        </Text>
        <Text style={styles.bottomSmall}>
          Efraín González Luna 2594 Col. Arcos Sur C.P. 44130 Guadalajara, Jal., MX
        </Text>
      </Page>
    </Document>
  );
}