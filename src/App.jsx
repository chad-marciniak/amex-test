import { Fragment, useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

function App() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const columnHelper = createColumnHelper();

  const columns = [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => (
        <button
          onClick={row.getToggleExpandedHandler()}
          style={{ cursor: 'pointer' }}
        >
          {row.getIsExpanded() ? 'V' : '>'}
        </button>
      ),
    },
    columnHelper.accessor((row) => row.picture.thumbnail, {
      id: 'thumbnail',
      header: () => <span>Thumbnail</span>,
      cell: (info) => <img src={info.getValue()} alt="thumbnail" />,
    }),
    columnHelper.accessor(
      (row) => [row.name.title, row.name.first, row.name.last].join(' '),
      {
        id: 'name',
        header: () => <span>Name</span>,
        cell: (info) => info.getValue(),
      },
    ),
    columnHelper.accessor((row) => row.dob.age, {
      id: 'age',
      header: () => <span>Age</span>,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor((row) => row.location.city, {
      id: 'city',
      header: () => <span>City</span>,
      cell: (info) => info.getValue(),
    }),
  ];
  const formatDate = (date) => {
    const dateObj = new Date(date);
    return `${dateObj.getMonth()}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
  };
  const renderSubComponent = ({ row }) => {
    const data = row.original;
    return (
      <div className="subcomponent-container">
        <img src={data.picture.large} />
        <div className="subcomponent-data">
          <p>Name: {[data.name.title, data.name.first, data.name.last].join(' ')}</p>
          <p>Address: {data.location.street.number} {data.location.street.name}</p>
          <p>{data.location.city} {data.location.state} {data.location.country} {data.location.postcode}</p>
          <p>Phone: {data.phone}</p>
          <p>Email: {data.email}</p>
          <p>Age: {data.dob.age}</p>
          <p>Birthdate: {formatDate(data.dob.date)}</p>
          
        </div>
      </div>
    );
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    renderSubComponent,
    getRowCanExpand: () => true,
    getSubRows: (row) => row.subRows,
  });

  useEffect(() => {
    axios
      .get('http://localhost:3000/users')
      .then((res) => {
        setData(res.data.results);
      })
      .catch((err) => {
        console.log(err);
      });
    return () => {
      setData([]);
    };
  }, []);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/users?page=${currentPage}`)
      .then((res) => {
        setData(res.data.results);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentPage]);

  return data.length ? (
    <div className="p-2">
      <table className="table-auto">
      <caption>User List:</caption>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th scope="col" key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id.value}>
              <tr>
                {row.getVisibleCells().map((cell) => (
                  <td scope="row" key={row.id.value}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </td>
                ))}
              </tr>
              {row.getIsExpanded() && (
                <tr>
                  <td scope="row" colSpan={row.getVisibleCells().length}>
                    {renderSubComponent({ row })}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      <div className="pagination">
      {currentPage > 1 ? (
        <button onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
      ) : null}
      <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
      <div>Current Page: {currentPage}</div>
      </div>
    </div>
  ) : (
    <div>Loading Data...</div>
  );
}

export default App;