import React from "react";
import { Flex, Table, Pagination } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "../../components/common/CustomButton";
import $lang from "../../utils/content/jp.json";

const ProductTable = ({
  editRow,
  deleteRow,
  dataSource,
  total,
  currentPage,
  itemsPerPage,
  onChange,
  isEdit,
}) => {
  const columns = [
    // {
    //   title: "No",
    //   dataIndex: "key",
    //   align: "center",
    //   width: "6%",
    // },
    {
      title: $lang.productCode,
      dataIndex: "code",
      align: "left",
      width: "15%",
      key: "code",
    },
    {
      title: `${$lang.productName}`,
      key: "name",
      width: "25%",
      dataIndex: "name",
      align: "left",
    },
    {
      title: `${$lang.packing}`,
      dataIndex: "packaging",
      key: "packaging",
      align: "left",
    },
    {
      title: `${$lang.storageFee}`,
      dataIndex: "storage_fee_rate",
      key: "storage_fee_rate",
      align: "left",
    },
    {
      title: `${$lang.billingClass}`,
      dataIndex: "fee_category",
      align: "left",
      key: "fee_category",
      render: (text) => {
        return text == 1 ? $lang.fullTimeRequest : $lang.firstBilling;
      },
    },
    isEdit === 1 ? (
      {
        title: `${$lang.change}`,
        dataIndex: "operation",
        render: (text, record, dataIndex) => {
          return (
            // <div className="flex justify-center">
            <Flex justify="center">
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

export default ProductTable;
