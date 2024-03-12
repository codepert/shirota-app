import React, { useEffect } from "react";
import { Flex } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "../../components/common/CustomButton";
import PaginationTable from "../../components/table/ajax.pagination.table";
import $lang from "../../utils/content/jp.json";

const ProductTable = ({
  data,
  editRow,
  deleteRow,
  isEdit,
  current,
  pageSize,
  totalCount,
  onPagechange,
}) => {
  const tableColumns = [
    {
      title: "No",
      dataIndex: "key",
      align: "center",
      width: "6%",
    },
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

  useEffect(() => {}, [isEdit, current, pageSize, data]);
  return (
    // <Table columns={warehouseColumns} dataSource={data} pagination={true} />
    <PaginationTable
      dataSource={data}
      columns={tableColumns}
      currentPage={current}
      itemsPerPage={pageSize}
      total={totalCount}
      handlePageChange={onPagechange}
    />
    // <Table
    //   bordered
    //   dataSource={data}
    //   columns={tableColumns}
    //   onChange={handleTableChange}
    //   pagination={paginationConfig}
    //   loading={loading}
    // />
    // <Pagination pageSizeOptions={5} defaultPageSize={5}/>
  );
};

export default ProductTable;
