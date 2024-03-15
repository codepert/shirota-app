import React from "react";
import { Flex, Table, Pagination } from "antd";
import CustomButton from "../../components/common/CustomButton";
import $lang from "../../utils/content/jp.json";
import { formatNumberManualInsertion } from "../../utils/helper.js";

const BillListTable = ({
  exportBillPDF,
  exportBillAmountPDF,
  dataSource,
  total,
  currentPage,
  itemsPerPage,
  onChange,
  isEdit,
}) => {
  const columns = [
    {
      title: `${$lang.productName}`,
      key: "product_name",
      width: "15%",
      dataIndex: "product_name",
    },
    {
      title: `${$lang.shipperCode}`,
      key: "shipper_code",
      width: "9%",
      dataIndex: "shipper_code",
    },
    {
      title: `${$lang.shipperName}`,
      key: "shipper_name",
      width: "30%",
      dataIndex: "shipper_name",
    },
    {
      title: `${$lang.receivePaymentAmount}`,
      key: "received_payment_amount",
      width: "8%",
      dataIndex: "received_payment_amount",
      render: (val) => formatNumberManualInsertion(val),
    },
    {
      title: `${$lang.handlingFee}`,
      key: "handling_cost",
      width: "8%",
      dataIndex: "handling_cost",
      render: (val) => formatNumberManualInsertion(val),
    },
    {
      title: `${$lang.storageFee}`,
      key: "total_storage_fee",
      width: "8%",
      dataIndex: "total_storage_fee",
      render: (val) => formatNumberManualInsertion(val),
    },
    {
      title: `${$lang.invoiceAmount}`,
      width: "8%",
      dataIndex: "bill_payment_amount",
      key: "bill_payment_amount",
      render: (val) => formatNumberManualInsertion(val),
    },
    {
      title: `${$lang.consumptionTax}`,
      width: "8%",
      dataIndex: "tax",
      key: "tax",
      render: (val) => formatNumberManualInsertion(val),
    },
    isEdit === 1 ? (
      {
        title: `#`,
        dataIndex: "operation",
        render: (text, record, dataIndex) => {
          return (
            <Flex justify="center">
              <CustomButton
                onClick={() => {
                  exportBillPDF(record);
                }}
                title={$lang.billingReport}
                size="small"
                className="btn-default btn-hover-black"
                style={{ backgroundColor: "transparent", color: "#000" }}
                visability={true}
              />{" "}
              <CustomButton
                onClick={() => {
                  exportBillAmountPDF(record);
                }}
                title={$lang.billingReportDetail}
                style={{ backgroundColor: "transparent", color: "#000" }}
                size="small"
                className="btn-default btn-hover-black"
                visability={true}
              />
            </Flex>
            // </div>
          );
        },
        align: "center",
        width: "25%",
      }
    ) : (
      <div></div>
    ),
  ];

  return (
    <>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        className="h-full overflow-auto pr-1"
      />
      <Flex justify="flex-end" className="my-5">
        <Pagination
          current={currentPage}
          pageSize={itemsPerPage}
          total={total}
          onChange={onChange}
          showSizeChanger
          className="p-1"
          defaultPageSize={10}
        />
      </Flex>
    </>
  );
};

export default BillListTable;
