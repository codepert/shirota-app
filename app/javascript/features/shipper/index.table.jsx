import React from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "../../components/common/CustomButton";
import LocalPaginationTable from "../../components/table/local.pagination.table";
import $lang from "../../utils/content/jp.json";

const ShipperTable = ({ data, editRow, deleteRow, isEdit }) => {
  const tableColumns = [
    {
      title: `${$lang.no}`,
      dataIndex: "key",
      align: "center",
      width: "8%",
    },
    {
      title: `${$lang.code}`,
      key: "code",
      dataIndex: "code",
      align: "center",
      width: "10%",
    },
    {
      title: `${$lang.shipperName}`,
      key: "name",
      dataIndex: "name",
      align: "center",
      render: (text, record) => {
        return (
          <div>
            {record.name.slice(0, 18)}
            {text.length >= 18 ? "..." : ""}
          </div>
        );
      },
    },
    {
      title: `${$lang.mainAddress}`,
      dataIndex: "main_address",
      key: "main_address",
      align: "center",
      render: (text, record) => {
        return (
          <div>
            {record.main_address.slice(0, 18)}
            {text.length >= 18 ? "..." : ""}
          </div>
        );
      },
    },
    {
      title: `${$lang.telNumber}`,
      dataIndex: "tel",
      key: "tel",
      align: "center",
      render: (text, record) => {
        return (
          <div>
            {record.tel.slice(0, 18)}
            {text.length >= 18 ? "..." : ""}
          </div>
        );
      },
    },
    {
      title: `${$lang.closingDate}`,
      dataIndex: "closing_date",
      key: "closing_date",
      align: "center",
      width: "8%",
    },
    isEdit === 1 ? (
      {
        title: `#`,
        dataIndex: "operation",
        width: "10%",
        render: (text, record) => {
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

export default ShipperTable;
