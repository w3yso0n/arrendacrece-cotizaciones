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
    borderColor: "#0b3b77",
    borderRadius: 2,
  },
  motto: {
    marginTop: 6,
    fontSize: 10,
    fontStyle: "italic",
    fontWeight: 700,
    color: "#0b3b77",
  },
  dateRight: { marginTop: 10, fontSize: 9, color: "#0b3b77" },
  helloBlock: { marginTop: 10 },
  helloName: { fontSize: 10, fontWeight: 700, color: "#0b3b77" },
  helloText: { marginTop: 2, fontSize: 9, color: "#0b3b77" },
  pill: {
    backgroundColor: "#0b1220",
    color: "#ffffff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontSize: 9,
    fontWeight: 700,
  },
  section: { marginTop: 10 },
  small: { fontSize: 8, color: "#0b3b77" },
  tableWrap: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#0b3b77",
  },
  leftCell: {
    width: 190,
    backgroundColor: "#d8e6f6",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: "#0b3b77",
    justifyContent: "center",
  },
  midCell: {
    width: 140,
    backgroundColor: "#d8e6f6",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: "#0b3b77",
    justifyContent: "center",
    alignItems: "center",
  },
  descCell: {
    width: 201,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  cellTextLabel: { fontSize: 8.5, fontWeight: 700, color: "#0b3b77" },
  cellTextValue: { fontSize: 8.5, fontWeight: 700, color: "#0b3b77" },
  descText: { fontSize: 7.6, color: "#0b3b77", lineHeight: 1.2 },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#0b3b77",
  },
  footNote: {
    marginTop: 10,
    fontSize: 8,
    color: "#0b3b77",
    textAlign: "center",
    fontStyle: "italic",
  },
  bottomBar: {
    marginTop: 10,
    backgroundColor: "#0b3b77",
    color: "#ffffff",
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
    color: "#0b3b77",
  },
  bottomSmall: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 8,
    color: "#0b3b77",
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

function pct(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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

        <View style={styles.helloBlock}>
          <Text style={styles.helloName}>
            {form.cliente || "—"}
          </Text>
          <Text style={styles.helloText}>
            Esperando se encuentre bien, le anexo propuesta para arrendamiento puro…
          </Text>
        </View>

        <View style={styles.tableWrap}>
          {[
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
              desc:
                "Precio del activo elegido por el cliente, de acuerdo a factura emitida por el proveedor. El precio mencionado podría reducirse en caso de anticipo.",
            },
            {
              label: "APERTURA DE CRÉDITO:",
              mid: `${form.comisionAperturaPct.toFixed(2)}%\n${mxn(
                derived.comisionApertura,
              )}`,
              desc:
                "Comisión de apertura pagadera al inicio de la operación (el importe NO incluye IVA).",
            },
            {
              label: "PLAZO:",
              mid: `${form.plazoMeses}\nMESES`,
              desc:
                "Plazo durante el que se otorga el uso del equipo arrendado, bajo condiciones mencionadas en contrato.",
            },
            {
              label: "RENTA MENSUAL FIJA:",
              mid: mxn(derived.rentaMensual),
              desc:
                "Cantidad monetaria correspondiente a los pagos a realizar durante el plazo establecido (el importe NO incluye IVA).",
            },
            {
              label: "DEPÓSITO EN GARANTÍA:",
              mid: mxn(derived.deposito),
              desc:
                "Cantidad monetaria por concepto de garantía por cualquier daño o deuda relativa referente al activo en arrendamiento. Este importe será devuelto íntegramente al arrendatario una vez concluido el plazo acordado siempre y cuando se hayan cumplido todas las obligaciones en contrato.",
            },
            {
              label: "VALOR RESIDUAL:",
              mid: `${form.valorResidualPct.toFixed(2)}%\n${mxn(
                derived.valorResidual,
              )}`,
              desc:
                "Cantidad monetaria estimada del valor del activo arrendado en el mercado al término del plazo contratado (el importe NO incluye IVA).",
            },
            {
              label: "SEGUROS:",
              mid: mxn(form.seguroMensual),
              desc:
                "Serán por cuenta exclusiva del arrendatario el estado (daños, destrucción, pérdida, riesgos, robo o cualquier índole en general) que sufra el equipo arrendado, por lo que se deberá contar con un seguro amplio (siendo beneficiaria la arrendadora), durante la totalidad del plazo del arrendamiento.",
            },
            {
              label: "RATIFICACIÓN DE CONTRATO:",
              mid: mxn(form.ratificacion),
              desc:
                "Gasto de ratificación de las firmas en contratos, por fedatario público (el importe NO incluye IVA).",
            },
            {
              label: "EQUIPO GPS:",
              mid: mxn(form.gpsMensual * form.plazoMeses),
              desc:
                "Cantidad monetaria correspondiente a los pagos a realizar durante el plazo establecido por renta de equipo de GPS (el importe NO incluye IVA).",
            },
            {
              label: "DERECHO PREFERENTE:",
              mid: form.cliente || "—",
              desc:
                "El arrendatario tendrá derecho preferente para adquirir, en su valor de mercado, el activo arrendado mediante: 1) Pago al contado; 2) Firma de un contrato de compra-venta a plazos ó 3) firma de un nuevo contrato de arrendamiento, siempre y cuando el plazo arrendado haya concluido y el arrendatario se encuentre al corriente en el cumplimiento de todas sus obligaciones en contrato.",
            },
          ].map((r, idx) => (
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

        <Text style={styles.footNote}>
          *En equipos de transporte, las placas y tenencia vehicular van por cuenta del
          cliente.{"\n"}
          *Esta cotización está sujeta a su aprobación y los importes pueden variar sin
          previo aviso.
        </Text>

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

