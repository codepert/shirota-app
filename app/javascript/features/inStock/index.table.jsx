import React from "react";
import { Space, Table } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "../../components/common/CustomButton";
import $lang from "../../utils/content/jp.json";

const IncomeTable = ({ data, editRow, deleteRow, is_edit }) => {
  const columns = [
    {
      title: $lang.productCode,
      key: "product_code",
      dataIndex: "product_code",
      width: 150,
    },
    {
      title: $lang.productName,
      dataIndex: "product_name",
      key: "product_name",
      width: "35%",
      render: (_, record) => (
        <>
          <p className="">{record.product_name}</p>
          <p>
            <span className="text-xs text-blue">{record.shipper_name}</span>{" "}
            <span className="px-5 text-xs text-blue">|</span>
            <span className="text-xs text-blue">
              {record.warehouse_name} ({record.warehouse_category_name})
            </span>
            <span className="px-5 text-xs text-blue">|</span>
            <span className="text-xs text-blue">
              {$lang.inStockDate}: {record.inout_on}
            </span>
          </p>
        </>
      ),
    },
    {
      title: $lang.packaging_set_names,
      dataIndex: "product_type",
      key: "product_type",
      render: (_, record) => (
        <>
          {/* <p className="text-lg">{record.product_type}</p>
          <p> */}
          <span className="text-xs">{record.product_type}</span>
          <span className="px-5 text-xs">/</span>
          <span className=" text-xs ">{record.handling_fee_rate}</span>{" "}
          <span className="px-5 text-xs">/</span>
          <span className="text-xs ">{record.storage_fee_rate}</span>
          {/* </p> */}
        </>
      ),
    },
    {
      title: $lang.lotoNumber,
      dataIndex: "lot_number",
      key: "lot_number",
    },
    {
      title: $lang.weight,
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: $lang.amount,
      dataIndex: "amount",
      key: "amount",
    },
    is_edit === 1 ? (
      {
        title: "#",
        key: "action",
        render: (_, record) => (
          <Space size="small">
            <CustomButton
              onClick={() => editRow(record.product_id)}
              title={$lang.change}
              icon={<EditOutlined />}
              size="small"
              className="btn-default btn-hover-black"
              style={{ backgroundColor: "transparent", color: "#000" }}
              visability={true}
            />
            <CustomButton
              onClick={() => deleteRow(record.product_id)}
              title={$lang.delete}
              icon={<DeleteOutlined />}
              style={{ backgroundColor: "transparent", color: "#000" }}
              size="small"
              className="btn-default btn-hover-black"
              visability={true}
            />
          </Space>
        ),
      }
    ) : (
      <div></div>
    ),
  ];
  return (
    <Table
      columns={columns}
      pagination={false}
      dataSource={data.map((row, index) => {
        return {
          ...row,
          key: index + 1,
        };
      })}
    />
  );
};

export default IncomeTable;
