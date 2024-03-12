import React, { useEffect, useState } from "react";
import { Table, Pagination } from "antd";
import PropTypes from "prop-types";
const AjaxPaginationTable = (props) => {
  const [page, setPage] = useState({ pn: 1, ps: 10 });
  const [data, setData] = useState([]);
  const { pn, ps } = page;

  const handlePageChange = (page, pageSize) => {
    props.onPageChange(page, pageSize);
  };
  useEffect(() => {
    let s = [];
    for (
      let i = (pn - 1) * ps;
      i <
      (pn * ps < props?.dataSource?.length
        ? pn * ps
        : props.dataSource?.length);
      i++
    ) {
      s.push({ ...props?.dataSource[i], no: i + 1 });
    }
    setData(s);
  }, [props.dataSource, props.flag, pn, ps]);

  useEffect(() => {
    if (props.toFirstPane) setPage({ ...page, pn: 1 });
  }, [props]);

  return (
    <div className="flex h-full flex-col w-full">
      <Table
        {...props}
        dataSource={data}
        pagination={false}
        sticky
        className="h-full overflow-auto pr-1"
      />
      <Pagination
        current={props.currentPage}
        pageSize={props.itemsPerPage}
        total={props.total}
        onChange={handlePageChange}
        pageSizeOptions={[10, 20, 50, 100]}
        showSizeChanger
        className="p-1"
        style={{ float: "right" }}
      />
    </div>
  );
};

AjaxPaginationTable.propTypes = {
  dataSource: PropTypes.array.isRequired,
};

export default AjaxPaginationTable;
