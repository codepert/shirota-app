import React from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "../../components/common/CustomButton";
import PaginationTable from "../../components/table/local.pagination.table";
import $lang from "../../utils/content/jp.json";

const WarehouseTable = ({ data, editRow, deleteRow, isEdit }) => {
  const warehouseColumns = [
    {
      title: `${$lang.no}`,
      dataIndex: "key",
      align: "center",
      width: "8%",
    },
    {
      title: `${$lang.warehouseName}`,
      key: "name",
      dataIndex: "name",
      align: "center",
      render: (text, record, dataIndex) => {
        return (
          <div>
            {record.name.slice(0, 18)}
            {text.length >= 18 ? "..." : ""}
          </div>
        );
      },
    },
    {
      title: `${$lang.responsibleCategory}`,
      dataIndex: "category",
      align: "center",
      width: "8%",
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
  return (
    // <Table columns={warehouseColumns} dataSource={data} pagination={true} />
    <PaginationTable dataSource={data} columns={warehouseColumns} />
    // <Pagination pageSizeOptions={5} defaultPageSize={5}/>
  );
};

export default WarehouseTable;
