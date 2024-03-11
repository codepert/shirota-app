import React from "react";
import { Table } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "../../components/common/CustomButton";
import $lang from "../../utils/content/jp.json";

const ReceivePaymentTable = ({ data, editRow, deleteRow, is_edit }) => {
  const columns = [
    {
      title: $lang.receivePaymentDate,
      dataIndex: "received_on",
      key: "received_on",
      render: (val) => (val != undefined ? val.replace(/\-/g, "/") : ""),
    },
    {
      title: $lang.shipperCode,
      dataIndex: "shipper_code",
      key: "shipper_code",
    },
    {
      title: $lang.shipperName,
      dataIndex: "shipper_name",
      key: "shipper_name",
    },
    {
      title: $lang.receivePaymentAmount,
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: $lang.receivePaymentDescription,
      dataIndex: "description",
      key: "description",
    },
    {
      title: $lang.receivePaymentProcessingDate,
      dataIndex: "processing_on",
      key: "processing_on",
      render: (val) => (val != undefined ? val.replace(/\-/g, "/") : ""),
    },
    is_edit === 1 ? (
      {
        title: "#",
        key: "action",
        render: (_, record) => (
          <div style={{ display: "flex" }}>
            <CustomButton
              onClick={() => {
                editRow(record);
              }}
              title={$lang.buttons.change}
              icon={<EditOutlined />}
              size="small"
              className="btn-default btn-hover-black"
              style={{ backgroundColor: "transparent", color: "#000" }}
              visability={true}
            />{" "}
            <CustomButton
              onClick={() => deleteRow(record.id)}
              title={$lang.buttons.delete}
              icon={<DeleteOutlined />}
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
        ),
      }
    ) : (
      <div></div>
    ),
  ];
  return (
    <Table columns={columns} dataSource={data} pagination={false} />
    // <Pagination pageSizeOptions={5} defaultPageSize={5}/>
  );
};

export default ReceivePaymentTable;
