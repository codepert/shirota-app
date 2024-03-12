import React from "react";
import { Table } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "../../components/common/CustomButton";
import LocalPaginationTable from "../../components/table/local.pagination.table";

import $lang from "../../utils/content/jp.json";

const WarehouseFeeTable = ({ data, editRow, deleteRow, isEdit }) => {
  const tableColumns = [
    {
      title: "No",
      dataIndex: "key",
      align: "center",
      width: "8%",
    },
    {
      title: `${$lang.packing}`,
      key: "packaging",
      dataIndex: "packaging",
      align: "center",
      render: (text, record) => {
        return (
          <div>
            {record.packaging.slice(0, 18)}
            {text.length >= 18 ? "..." : ""}
          </div>
        );
      },
    },
    {
      title: `${$lang.handlingFeeUnitPrice}`,
      dataIndex: "handling_fee_rate",
      key: "handling_fee_rate",
      align: "center",
    },
    {
      title: `${$lang.storageFeeUnitPrice}`,
      dataIndex: "storage_fee_rate",
      key: "storage_fee_rate",
      align: "center",
    },
    {
      title: $lang.billingClass,
      dataIndex: "fee_category",
      key: "fee_category",
      align: "center",
      render: (text) => {
        return text == 1 ? $lang.fullTimeRequest : $lang.firstBilling;
      },
    },
    isEdit === 1 ? (
      {
        title: `${$lang.change}`,
        dataIndex: "operation",
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

export default WarehouseFeeTable;
