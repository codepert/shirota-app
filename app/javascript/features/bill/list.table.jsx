import React from "react";
import moment from "moment";
import { Flex, Table, Pagination } from "antd";
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
      dataIndex: "shipper_name",
      align: "center",
      key: "shipper_name",
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
            <div className="flex justify-center">
              <div className="hidden rounded-full"></div>
              <div className="p-2 rounded-full cursor-pointer text-center">
                <CustomButton
                  onClick={() => {
                    exportBillPDF(record.id);
                  }}
                  title={$lang.billingReport}
                  size="small"
                  className="btn-default btn-hover-black"
                  style={{ backgroundColor: "transparent", color: "#000" }}
                  visability={true}
                />{" "}
                <CustomButton
                  onClick={() => {
                    exportBillAmountPDF(record.id);
                  }}
                  title={$lang.detail}
                  style={{
                    backgroundColor: "transparent",
                    color: "#000",
                    marginLeft: 10,
                  }}
                  size="small"
                  className="btn-default btn-hover-black"
                  visability={true}
                />
              </div>
            </div>
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
