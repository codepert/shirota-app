import React, { useEffect } from "react";
import moment from "moment";
import { Flex, Table, Pagination, Spin } from "antd";
import CustomButton from "../../components/common/CustomButton.js";
import $lang from "../../utils/content/jp.json";

const BillListTable = ({
  exportBillPDF,
  exportBillAmountPDF,
  dataSource,
  total,
  currentPage,
  itemsPerPage,
  onChange,
  isEdit,
  isBillExportSpinLoading,
  isBillAmountExportSpinLoading,
}) => {
  const columns = [
    {
      title: $lang.ym,
      key: "billed_on",
      width: "20%",
      dataIndex: "billed_on",
      align: "center",
      render: (val) =>
        val != undefined ? val.replace(/\-/g, "/").substring(0, 7) : "",
    },
    {
      title: $lang.count,
      dataIndex: "cnt",
      key: "cnt",
      align: "center",
    },
    {
      title: $lang.duration,
      dataIndex: "duration",
      key: "duration",
      align: "center",
      render: (val) => (val != undefined ? val.replace(/\-/g, "/") : ""),
    },
    {
      title: $lang.warehouseName,
      dataIndex: "warehouse_name",
      align: "center",
      key: "warehouse_name",
    },
    {
      title: $lang.precessDate,
      dataIndex: "billed_on",
      align: "center",
      key: "billed_on",
      render: (val) =>
        val != undefined ? moment(val).format("YYYY/MM/DD HH:mm:ss") : "",
    },
    isEdit === 1 ? (
      {
        title: `#`,
        dataIndex: "operation",
        render: (text, record, dataIndex) => {
          return (
            <Flex justify="center">
              <Spin spinning={isBillExportSpinLoading}>
                <CustomButton
                  onClick={() => {
                    console.log("record", record);
                    exportBillPDF(record);
                  }}
                  title={$lang.billingReport}
                  size="small"
                  className="btn-default btn-hover-black"
                  style={{
                    backgroundColor: "transparent",
                    color: "#000",
                    display: "none",
                  }}
                  visability={true}
                />{" "}
              </Spin>
              <Spin spinning={isBillAmountExportSpinLoading}>
                <CustomButton
                  onClick={() => {
                    exportBillAmountPDF(record);
                  }}
                  title={$lang.detail}
                  style={{
                    backgroundColor: "transparent",
                    color: "#000",
                    marginLeft: 5,
                  }}
                  size="small"
                  className="btn-default btn-hover-black"
                  visability={true}
                />
              </Spin>
            </Flex>
          );
        },
        align: "center",
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
      <Flex justify="flex-end" style={{ marginTop: 10, marginBottom: 10 }}>
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
