import React, { useEffect, useState } from "react";
import { Flex, Table } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "../../components/common/CustomButton";
import PaginationTable from "../../components/table/ajax.pagination.table";
import $lang from "../../utils/content/jp.json";
import { productURL } from "../../utils/constants";
import { API } from "../../utils/helper";

const ProductTable = ({
  // data,
  editRow,
  deleteRow,
  isEdit,
  isposted,
  // paginationConfig,
  // handleTableChange,
  // tloading,
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
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({});

  const loadTableData = async () => {
    setIsLoading(true);
    //  const urlParam = `${productURL}?offset=${paginationConfig.current}&limit=${paginationConfig.pageSize}&keyword=${searchText}`;
    const urlParam = `${productURL}?offset=${pagination.current}&limit=${pagination.pageSize}`;
    API.get(urlParam).then((res) => {
      let index = 1;
      let products = res.data.map((item) => {
        let feeData = item.warehouse_fee;
        return {
          id: item.id,
          key: index++,
          name: item.name,
          packaging: feeData.packaging,
          storage_fee_rate: feeData.storage_fee_rate,
          handling_fee_rate: feeData.handling_fee_rate,
          fee_category: feeData.fee_category,
          code: item.code,
          specification: item.specification,
          warehouse_fee_id: feeData.id,
        };
      });
      setIsLoading(false);
      // setPaginationConfig({
      //   ...paginationConfig,
      //   total: res.headers["x-total-count"],
      // });
      setTotal(parseInt(res.headers["x-total-count"]));
      setDataSource(products);
    });
  };
  const handleTableChange = (pagination, filters, sorter) => {
    console.log(pagination, sorter);
    setPagination(pagination);
    loadTableData();
  };

  useEffect(() => {
    loadTableData();
  }, [isposted]);

  return (
    <Table
      columns={tableColumns}
      dataSource={dataSource}
      loading={isLoading}
      onChange={handleTableChange}
      pagination={pagination}
      rowKey={(record) => record.id}
      scroll={{ x: "max-content", y: 600 }}
    />
  );
};

export default ProductTable;
