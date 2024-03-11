import React, { useState, useEffect } from "react";
import { Input, Layout, Pagination, Card, Flex, Button } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import { openNotificationWithIcon } from "../components/common/notification";
import CustomButton from "../components/common/CustomButton";
import ProductRegisterModal from "../features/product/register.modal";
import DeleteModal from "../components/common/delete.modal";
import CTable from "../components/CTable/CCTable";
import $lang from "../utils/content/jp.json";
import { productURL } from "../utils/constants";
import { API } from "../utils/helper";

const { Content } = Layout;

const ProductPage = ({ is_edit }) => {
  const [searchText, setSearchText] = useState("");
  const [isposted, setIsPosted] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [productData, setProductData] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [isDeletedModalVisible, setIsDeletedModalVisible] = useState(false);
  const [handleId, setHandleId] = useState("");

  const handlePageChange = (page, pageSize) => {
    setCurrentPage((page - 1) * pageSize);
    setItemPerPage(pageSize);
  };

  const getProducts = () => {
    const urlParam = `${productURL}?offset=${currentPage}&limit=${itemsPerPage}&keyword=${searchText}`;
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

      setTotal(res.data.count);
      setProductData(products);
    });
  };

  const handleSearchText = (e) => {
    setSearchText(e.target.value);
  };

  const handleRegister = (data) => {
    console.log("register data", data);
    if (typeof data.id == "undefined") {
      createProduct(data);
    } else {
      updateProduct(data);
    }
  };

  const createProduct = (data) => {
    API.post(productURL, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
        handleHideModal();
        setIsPosted(!isposted);
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.success,
          err.message
        );
      });
  };

  const updateProduct = (data) => {
    API.put(`${productURL}/${data.id}`, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
        handleHideModal();
        setIsPosted(!isposted);
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.success,
          err.message
        );
      });
  };

  const handleShowDeleteModal = () => {
    setIsDeletedModalVisible(true);
  };

  const handleHideDeleteModal = () => {
    setIsDeletedModalVisible(false);
  };

  const handleDelete = (deltedId) => {
    API.delete(`${productURL}/${deltedId}`)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
        setIsPosted(!isposted);
        handleHideDeleteModal();
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.error,
          err.message
        );
      });
  };

  const handleHideModal = () => {
    setIsModalVisible(false);
  };

  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  const productListColumns = [
    // {
    //   title: "No",
    //   dataIndex: "key",
    //   align: "center",
    //   width: "8%",
    // },
    {
      title: $lang.productCode,
      dataIndex: "code",
      align: "left",
      width: "20%",
      key: "code",
    },
    {
      title: `${$lang.productName}`,
      key: "name",
      width: "20%",
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
    is_edit === 1 ? (
      {
        title: `${$lang.change}`,
        dataIndex: "operation",
        render: (text, record, dataIndex) => {
          return (
            <div className="flex justify-center">
              <div className="hidden rounded-full">
                {/* {(star_color = record.done == true ? "text-yellow-500" : "")} */}
              </div>
              <div className="p-2 rounded-full cursor-pointer text-center">
                <CustomButton
                  onClick={() => {
                    setModalData(record);
                    handleShowModal();
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
                    handleShowDeleteModal();
                    setHandleId(record.id);
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
        width: "15%",
      }
    ) : (
      <div></div>
    ),
  ];

  useEffect(() => {
    getProducts();
  }, [currentPage, itemsPerPage, isposted]);

  return (
    <div>
      <Content style={{ width: 1024 }} className="mx-auto content-h">
        <Card
          style={{ width: "100%", marginTop: 20, marginBottom: 20 }}
          className="py-2 my-2"
          bordered={false}
        >
          <div>
            <div className="mt-5">
              <div className="">
                <Flex gap="middle" align="start">
                  <Flex
                    style={{
                      width: "100%",
                    }}
                    justify="space-between"
                  >
                    <div className="w-50">
                      <Input
                        value={searchText}
                        placeholder={$lang.search}
                        className="py-1 rounded-md focus:box-shadow-none"
                        onChange={handleSearchText}
                        onPressEnter={(e) => {
                          if (e.keyCode === 13) {
                            getProducts();
                          }
                        }}
                      />
                    </div>
                    {is_edit === 1 ? (
                      <Button
                        onClick={() => {
                          handleShowModal();
                          setModalData(null);
                        }}
                        className="btn-bg-black"
                      >
                        {$lang.addNew}
                      </Button>
                    ) : (
                      <div></div>
                    )}
                  </Flex>
                </Flex>
              </div>
            </div>
            <ProductRegisterModal
              isOpen={isModalVisible}
              onClose={handleHideModal}
              onSave={handleRegister}
              initialValues={modalData}
            />
            <DeleteModal
              isOpen={isDeletedModalVisible}
              onClose={handleHideDeleteModal}
              onDelete={handleDelete}
              deletedId={handleId}
            />
            <div className="mt-5">
              <CTable
                rowKey={(node) => node.key}
                dataSource={productData}
                columns={productListColumns}
              />
              <div className="flex justify-center w-full bg-base-200 rounded-md mt-5">
                <Pagination
                  current={currentPage}
                  pageSize={itemsPerPage}
                  total={total}
                  onChange={handlePageChange}
                  pageSizeOptions={[10, 20, 50, 100]}
                  showSizeChanger
                  className="p-1"
                  style={{ float: "right" }}
                />
              </div>
            </div>
          </div>
        </Card>
      </Content>
    </div>
  );
};
export default ProductPage;
