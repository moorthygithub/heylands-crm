import useApiToken from "@/components/common/useApiToken";
import {
  WithoutErrorComponent,
  WithoutLoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import { useFetchInvoice } from "@/hooks/useApi";
import { decryptId } from "@/utils/encyrption/Encyrption";
import { Printer } from "lucide-react";
import moment from "moment";
import { toWords } from "number-to-words";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import logo from "../../../assets/invoice/globe.png";
const PackingInvoice = () => {
  const containerRef = useRef();
  const { id } = useParams();
  const decryptedId = decryptId(id);
  const token = useApiToken();
  const [invoiceData, setInvoiceData] = useState({});
  const [branchData, setBranchData] = useState({});
  const [invoiceSubData, setInvoiceSubData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { data: fetchInvoiceData } = useFetchInvoice(decryptedId);
  useEffect(() => {
    setInvoiceData(fetchInvoiceData?.invoice);
    setInvoiceSubData(fetchInvoiceData?.invoiceSub);
    setBranchData(fetchInvoiceData?.branch);
  }, [fetchInvoiceData]);
  const usdToInrRate = 86.05;

  const totalAmount =
    invoiceSubData?.reduce((acc, item) => {
      const totalProduct =
        Number(item.invoiceSub_item_packing_no) *
        Number(item.invoiceSub_ctns) *
        Number(item.invoiceSub_item_rate_per_pc) *
        (Number(item.invoiceSub_item_packing_no) *
          Number(item.invoiceSub_ctns) *
          Number(item.invoiceSub_item_rate_per_pc) *
          usdToInrRate *
          0.05);
      return acc + totalProduct;
    }, 0) || 0;

  const [rupees, paise] = totalAmount?.toFixed(2).split(".");

  const totalInWords = `${toWords(Number(rupees))} Rupees${
    paise !== "00" ? ` and ${toWords(Number(paise))} Paise` : ""
  }`;
  const handlPrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "invoice",
    pageStyle: `
                @page {
                size: A4;
                margin: 5mm;
                
              }
              @media print {
                body {
                  border: 0px solid #000;
                      font-size: 10px; 
                  margin: 0mm;
                  padding: 0mm;
                  min-height: 100vh;
                }
                   table {
                   font-size: 11px;
                 }
                .print-hide {
                  display: none;
                }
               
              }
              `,
  });

  if (loading) {
    return <WithoutLoaderComponent name="Invoice  Data" />;
  }

  if (error) {
    return (
      <WithoutErrorComponent
        message="Error Fetching Invoice Data"
        refetch={() => fetchInvoiceData}
      />
    );
  }

  return (
    <div>
      <div>
        <button
          onClick={handlPrintPdf}
          className="fixed top-5 right-10 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600"
        >
          <Printer className="h-4 w-4" />
        </button>
      </div>
      <div className="flex w-full p-2 gap-2 relative">
        <div ref={containerRef} className="w-full print-container">
          <table className="w-full table-fixed">
            <thead>
              <tr>
                <td colSpan="100%" className="text-center py-2 p-0">
                  <p className="font-bold">PACKING</p>
                </td>
              </tr>
            </thead>

            <tbody>
              <tr className="print-section">
                <td
                  className="print-body text-[10px] border border-black p-0"
                  colSpan="100%"
                >
                  <div className="grid grid-cols-12 w-full">
                    <div className="col-span-6 grid grid-cols-12   border-r  border-black ">
                      <div className="col-span-5">
                        <div className="px-1 font-bold">Exporter</div>
                        <div className="print:border-l border-black">
                          <img src={logo} alt="logo" className="w-30 h-20" />
                        </div>
                        <div>TRUST IS OUR ASSET</div>
                      </div>

                      <div className="col-span-7">
                        <div className="p-1 space-y-1">
                          <p>{invoiceData?.branch_name},</p>

                          <div className="space-y-1">
                            {invoiceData?.branch_address
                              ?.split("\n")
                              .map((line, index) => (
                                <div key={index}>
                                  <span>{line}</span>
                                </div>
                              ))}
                          </div>

                          <p>CIN: U52110TN1987PTC015202</p>
                          <p>GST NO: {branchData?.branch_gst}</p>
                          <p>EMAIL: {branchData?.branch_email_id}</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-6  border-black text-[10px]">
                      <div className="grid grid-cols-12 border-b border-black">
                        <div className="col-span-5 border-r border-black p-1">
                          <p className="font-semibold">Invoice No. & Date</p>
                          <p>
                            {invoiceData?.invoice_no}/{" "}
                            {invoiceData?.contract_date
                              ? moment(invoiceData?.contract_date).format(
                                  "DD-MM-YYYY"
                                )
                              : ""}
                          </p>
                        </div>
                        <div className="col-span-7 p-1">
                          <p className="font-semibold">Exporter's Ref.</p>
                          <p> {invoiceData?.contract_pono} </p>
                        </div>
                      </div>

                      <div className="border-b border-black p-1">
                        <p className="font-semibold">
                          Buyer's Order No. & Date
                        </p>
                        <p>
                          {" "}
                          {invoiceData?.invoice_ref}/
                          {invoiceData?.invoice_date
                            ? moment(invoiceData?.invoice_date).format(
                                "DD-MM-YYYY"
                              )
                            : ""}
                        </p>
                      </div>

                      <div className="px-1 pt-1">
                        <p className="font-semibold">
                          Other Reference(s) / Fssai No.{" "}
                          {branchData?.branch_fssai_no}
                          <p>
                            {" "}
                            IEC NO. : {branchData?.branch_iec} RBI NO.:{" "}
                            {branchData?.branch_rbi_no}
                          </p>
                        </p>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="print-section">
                <td
                  className="print-body text-[10px] border border-black p-0"
                  colSpan="100%"
                >
                  {" "}
                  <div className="grid grid-cols-2">
                    <div>
                      <div className="border-r border-black p-1 space-y-2">
                        <p>Consignee</p>
                        <p> {invoiceData?.invoice_consignee}</p>

                        <div className="space-y-2">
                          {invoiceData?.invoice_consignee_add
                            ?.split("\n")
                            .map((line, index) => (
                              <div key={index}>
                                <span>{line}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className=" p-1">Buyer (if other than consignee)</p>
                      <p className="flex justify-center items-center min-h-16">
                        {invoiceData?.invoice_buyer ==
                        invoiceData?.invoice_consignee ? (
                          <>SAME AS CONSIGNEE</>
                        ) : (
                          <div className="space-y-2">
                            <p> {invoiceData?.invoice_consignee}</p>
                            {invoiceData?.invoice_consignee_add
                              ?.split("\n")
                              .map((line, index) => (
                                <div key={index}>
                                  <span>{line}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="print-section">
                <td
                  className="print-body text-[10px] border border-black p-0"
                  colSpan="100%"
                >
                  {" "}
                  <div className="grid grid-cols-2">
                    <div className="grid grid-cols-2">
                      <div className="border-r border-black p-1 ">
                        <p className="font-bold">Pre-Carriage by</p>
                        <p className="font-bold text-center mt-1">
                          {" "}
                          {invoiceData?.invoice_precarriage}
                        </p>
                      </div>
                      <div className="border-r border-black p-1 ">
                        <p>Place of Receipt by Pre-Carrier</p>
                        <p className="font-bold text-center mt-1">
                          {" "}
                          {invoiceData?.invoice_prereceipts}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="border-r border-black p-1 ">
                        <p className="font-bold">Country of Origin of Goods</p>
                        <p className="font-bold text-center mt-2">
                          {" "}
                          <p className="font-bold text-center mt-1">
                            {" "}
                            {invoiceData?.invoice_loading_country}
                          </p>
                        </p>
                      </div>
                      <div className=" p-1 ">
                        <p>Country of Final Destination</p>
                        <p className="font-bold text-center mt-1">
                          {invoiceData?.invoice_destination_country}
                        </p>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>

              <tr className="print-section">
                <td
                  className="print-body text-[10px] border border-black p-0"
                  colSpan="100%"
                >
                  {" "}
                  <div className="grid grid-cols-2">
                    <div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="border-r border-black p-1 ">
                          <p className="font-bold">Vessel / Flight No.</p>
                          <p className="font-bold text-center mt-1">
                            {" "}
                            {invoiceData?.invoice_vessel}
                          </p>
                        </div>
                        <div className="border-r border-black p-1 ">
                          <p>Port of Loading</p>
                          <p className="font-bold text-center mt-1">
                            {" "}
                            {invoiceData?.invoice_loading_port}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="border-r border-black p-1 ">
                          <p className="font-bold">Port of Discharge</p>
                          <p className="font-bold text-center mt-1">
                            {" "}
                            {invoiceData?.invoice_destination_port}
                          </p>
                        </div>
                        <div className="border-r border-black p-1 ">
                          <p>Final Destination</p>
                          <p className="font-bold text-center mt-1">
                            {" "}
                            {invoiceData?.invoice_destination_country}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className=" p-1 ">
                        <p className="font-bold">
                          Terms of Delivery and Payment
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-center mt-1">
                          {invoiceData?.invoice_payment_terms}
                        </p>
                        <p className="font-bold text-center mt-1">
                          {" "}
                          {invoiceData?.invoice_delivery_terms}
                        </p>
                        {/* <p className="font-bold text-center mt-1">C & I</p>
                        <p className="font-bold text-center mt-1">
                          D/P TERMS ON SIGHT{" "}
                        </p> */}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>

              <tr className="print-section">
                <td
                  colSpan="100%"
                  className="border border-black text-[10px] p-0"
                >
                  <table className="min-w-full text-[10px] text-center border-collapse">
                    <thead className=" text-center text-[10px]">
                      <tr>
                        <th className="border-r border-b border-black px-1 py-0.5">
                          <div className="text-[8px]">
                            Marks & Nos. / No. & Kind of Pkgs.
                          </div>
                        </th>
                        <th className="border-r border-b border-black px-1 py-0.5 w-[30%]">
                          <div className="text-[8px]">Description</div>
                        </th>

                        <th
                          rowSpan={2}
                          className="border-r border-black px-1 py-0.5 align-middle"
                        >
                          HSN CODE
                        </th>
                        <th
                          rowSpan={2}
                          className="border-r border-black px-1 py-0.5 align-middle"
                        >
                          TOTAL CARTON
                        </th>
                        <th
                          className="border-b border-black px-1 py-0.5 align-middle"
                          colSpan={2}
                        >
                          Remarks
                        </th>
                      </tr>
                      <tr>
                        <th className=" px-1 py-0.5 font-mono">NIRU/HEY/LON</th>
                        <th className="border-r border-black px-1 py-0.5 font-mono underline">
                          TOTAL PACKAGES:{" "}
                          {invoiceSubData?.length
                            ? invoiceSubData[
                                invoiceSubData.length - 1
                              ]?.invoiceSub_ct?.split("-")[1]
                            : ""}
                        </th>

                        <th className="border-r border-black px-1 py-0.5 ">
                          Nt.Wt.{" "}
                        </th>
                        <th className="border-b border-black px-1 py-0.5 ">
                          Gr.Wt.{" "}
                        </th>
                      </tr>
                      <tr>
                        <td className="text-center">CTN/BAG NO:</td>
                        <td className="border-r border-black text-left"></td>
                        <td className="border-t border-r border-black text-left"></td>
                        <td className="border-t border-r border-black text-left"></td>
                        <td className="border-t border-r border-black text-left"></td>
                        <td className="border-t  border-black text-left"></td>
                      </tr>
                    </thead>

                    <tbody>
                      {invoiceSubData?.map((item, key) => (
                        <tr className="font-semibold ">
                          <td className="px-2 text-left">
                            {item?.invoiceSub_ct}
                          </td>
                          <td className="border-r border-black px-1 text-left w-[30%]">
                            <table className="w-full">
                              <tbody>
                                <tr>
                                  <td className="print:text-[8px] text-left">
                                    {item?.invoiceSub_item_description}
                                  </td>
                                  <td className="print:text-[8px] text-right">
                                    {item?.invoiceSub_item_box_size}
                                    {item?.invoiceSub_item_packing_unit}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>

                          <td className="  border-r border-black px-1">
                            {item?.invoiceSub_item_hsnCode}
                          </td>
                          <td className=" border-r border-black px-1">
                            {item?.invoiceSub_item_packing_no *
                              item?.invoiceSub_ctns}{" "}
                          </td>
                          <td className="  border-r border-black px-1">
                            <div>Nt.Wt. </div>
                          </td>
                          <td className="px-1">
                            <div>Gr.Wt. </div>{" "}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold ">
                        <td
                          colSpan={2}
                          className="border-r border-black text-right px-1 py-0.5"
                        ></td>

                        <td className="border-r border-black px-1"></td>
                        <td className="border-t  border-r border-black px-1">
                          {invoiceSubData?.reduce(
                            (acc, item) =>
                              acc +
                              (item?.invoiceSub_item_packing_no *
                                item?.invoiceSub_ctns || 0),
                            0
                          )}
                        </td>
                        <td className="border-t  border-r border-black px-1">
                          {invoiceSubData
                            ?.reduce((acc, item) => {
                              const total =
                                Number(item.invoiceSub_item_packing_no) *
                                Number(item.invoiceSub_ctns) *
                                Number(item.invoiceSub_item_rate_per_pc);
                              return acc + total;
                            }, 0)
                            .toFixed(2)}
                        </td>
                        <td className="border-t  border-black px-1">
                          {invoiceSubData
                            ?.reduce((acc, item) => {
                              const total =
                                Number(item.invoiceSub_item_packing_no) *
                                Number(item.invoiceSub_ctns) *
                                Number(item.invoiceSub_item_rate_per_pc);
                              return acc + total;
                            }, 0)
                            .toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr className="print-section">
                <td
                  colSpan="100%"
                  className="border border-black text-[10px] p-0"
                >
                  <div className="p-2">
                    <p className="font-bold">
                      Amount Chargeable
                      <span className="font-mono uppercase">
                        {" "}
                        TOTAL INR IN {totalInWords}
                      </span>
                      (in words)
                      <span className=" font-semibold ml-3"></span>
                    </p>
                  </div>

                  <div className="text-[10px] ">
                    <p className="flex p-2"></p>

                    <p className="block font-semibold ml-4"></p>
                    <p className="block font-semibold ml-4 "></p>
                  </div>
                  <div className="grid grid-cols-12  text-[10px] mt-3">
                    <div className="col-span-8">
                      <div className=" px-2  mt-4">
                        <span className="underline"> Declaration:</span>
                        <p className="font-bold">
                          {" "}
                          We declare that this invoice shows the actual price of
                          the goods described and that all particulars are true
                          and correct.
                        </p>
                      </div>
                    </div>

                    <div className="col-span-4">
                      <div className="border-t border-l border-black pt-4  px-4 h-full">
                        <p className="font-bold leading-none mb-6">
                          For {invoiceData?.branch_name}
                        </p>
                        <div className="flex flex-col items-center justify-center font-bold mt-16">
                          <p>{invoiceData?.invoice_sign} </p>
                          <p>{invoiceData?.invoice_position} </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackingInvoice;
