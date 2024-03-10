import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Typography, Breadcrumb, Button, Flex } from "antd";
import { Layout, Menu } from "antd";
import { siteInfo } from "../../../utils/content";
import { useAuth } from "../../../hooks/useAuth";
import { navigatiionsURL } from "../../../utils/constants";
import $lang from "../../../utils/content/jp.json";
import moment from "moment";
import { getAuthUsername } from "../../../utils/helper";

const NavbarSection = () => {
  const { logoutAction } = useAuth();
  const { Title } = Typography;
  const { Header } = Layout;
  const navigate = useNavigate();
  const location = useLocation();
  const [current, setCurrent] = useState("");
  const [title, setTitle] = useState("");
  const [navigations, setNavigations] = useState([]);
  const [realData, setRealData] = useState([]);
  const [username, setUserName] = useState("");
  const user = useAuth();

  const name = getAuthUsername();

  const onMenuClick = (e) => {
    const { label } = navigations.find((item) => item.key === e.key) || {};
    setTitle(label);
    setCurrent(e.key);
    navigate(e.key);
  };

  const getNavigations = () => {
    axios.get(`${navigatiionsURL}`).then((res) => {
      const allData = res.data.map((item) => {
        return {
          id: item.id,
          label: item.name,
          key: item.path,
          parent_id: item.parent_id,
        };
      });

      const parentArray = allData
        .map((item) => item.parent_id)
        .filter((parentId) => parentId !== null);

      const newArray = [];

      allData.forEach((item) => {
        if (item.parent_id === null) {
          if (!parentArray.includes(item.id))
            newArray.push({
              label: item.label,
              key: item.key,
            });
        } else {
          const parentItem = newArray.find(
            (parent) => parent.key === item.parent_id
          );
          if (parentItem) {
            if (!parentItem.children) {
              parentItem.children = [];
            }
            parentItem.children.push({
              label: item.label,
              key: item.key,
            });
          } else {
            const newParentItem = {
              label: allData.find((data) => data.id == item.parent_id).label,
              key: item.parent_id,
              children: [
                {
                  label: item.label,
                  key: item.key,
                },
              ],
            };
            newArray.push(newParentItem);
          }
        }
      });

      setRealData(newArray);
      setNavigations(allData);
    });
  };

  useEffect(() => {
    getNavigations();
  }, []);

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const { label } = navigations.find((item) => item.key === current) || {};
    setTitle(label);
  }, [current, navigations]);

  useEffect(() => {
    if (user) setUserName(user.state.authUserName);
  }, [user]);

  return (
    <Layout>
      <Flex
        justify="space-between"
        style={{
          backgroundColor: "#abd090",
        }}
      >
        <div className="" style={{ backgroundColor: "#abd090" }}>
          <Title level={5} style={{ marginLeft: "20px" }}>
            <Link to="/" style={{ color: "#000", fontWeight: 800 }}>
              {siteInfo.title}
            </Link>
          </Title>
        </div>
        <div className="items-center">
          <p
            style={{
              backgroundColor: "#abd990",
            }}
          >
            ユーザー：<b>{name}</b>
          </p>
          <Button
            className="btn-bg-black"
            onClick={logoutAction}
            style={{
              marginLeft: "10px",
              border: "none",
              float: "right",
            }}
          >
            <Link to="/signin" style={{ color: "#000" }}>
              {$lang.buttons.logout}
            </Link>
          </Button>
        </div>
      </Flex>
      <Flex
        justify="space-between"
        style={{
          backgroundColor: "#bfd9ab",
        }}
      >
        <Menu
          onClick={onMenuClick}
          selectedKeys={[current]}
          mode="horizontal"
          items={realData}
          style={{
            marginLeft: 190,
            backgroundColor: "#bfd9ab",
          }}
        />
        <div style={{ marginTop: 10, marginRight: 20 }}>
          <span>{$lang.date} : </span>
          <span>{moment().format("YYYY/MM/DD")}</span>
        </div>
      </Flex>
      <Breadcrumb
        items={[{ title }]}
        style={{
          padding: "10px 50px ",
          backgroundColor: "#fff",
        }}
      />
    </Layout>
  );
};

export default NavbarSection;
