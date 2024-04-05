import React from "react";
import { Table } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "../../components/common/CustomButton";
import LocalPaginationTable from "../../components/table/local.pagination.table";

import $lang from "../../utils/content/jp.json";

const TaxRateTable = ({ data, editRow, deleteRow, isEdit }) => {
  const tableColumns = [
    {
      title: "No",
      dataIndex: "key",
      align: "center",
      width: "8%",
    },
    {
      title: `${$lang.tax_date}`,
      dataIndex: "ab_date",
      key: "ab_date",
      render: (val) => (val != undefined ? val.replace(/\-/g, "/") : ""),
    },
    {
      title: `${$lang.tax_type}`,
      dataIndex: "tax_type",
      key: "tax_type",
    },
    {
      title: $lang.tax_rate,
      dataIndex: "tax_rate",
      key: "tax_rate",
    },
    isEdit === 1 ? (
      {
        title: `#`,
        dataIndex: "operation",
        width: "10%",
        render: (_, record) => {
          return (
            <div className="flex justify-center items-center">
              <div className="hidden rounded-full"></div>
              <div className="p-2 rounded-full cursor-pointer items-center text-center">
                <CustomButton
                  onClick={() => {
                    editRow(record);
                  }}
                  title={$lang.change}
                  icon={<EditOutlined />}
                  size="small"
                  className="btn-default btn-hover-black"
                  style={{ backgroundColor: "transparent", color: "#000" }}
                  visability={true}
                />{" "}
              </div>
              <div className="p-2 rounded-full cursor-pointer items-center text-center ml-2">
                <CustomButton
                  onClick={() => {
                    deleteRow(record);
                  }}
                  title={$lang.delete}
                  icon={<DeleteOutlined />}
                  style={{ backgroundColor: "transparent", color: "#000" }}
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
  return <LocalPaginationTable dataSource={data} columns={tableColumns} />;
};

export default TaxRateTable;
