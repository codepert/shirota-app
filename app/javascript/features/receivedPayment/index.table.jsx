import React, { useEffect } from "react";
import { Table, Pagination, Flex } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "../../components/common/CustomButton";
import $lang from "../../utils/content/jp.json";

const ReceivePaymentTable = ({
  editRow,
  dataSource,
  total,
  currentPage,
  itemsPerPage,
  onChange,
  isEdit,
}) => {
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
    isEdit === 1 ? (
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
            {/* <CustomButton
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
            /> */}
          </div>
        ),
      }
    ) : (
      <div></div>
    ),
  ];

  useEffect(() => {
    console.log("total", total);
  }, [total]);
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

export default ReceivePaymentTable;
