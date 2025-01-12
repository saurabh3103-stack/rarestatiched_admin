import ActionButtons from '@/components/common/action-buttons';
import Avatar from '@/components/common/avatar';
import { NoDataFound } from '@/components/icons/no-data-found';
import StatusColor from '@/components/order/status-color';
import Badge from '@/components/ui/badge/badge';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import TitleWithSort from '@/components/ui/title-with-sort';
import { useCreateConversations } from '@/data/conversations';
import { MappedPaginatorInfo, Order, Product, SortOrder } from '@/types';
import { getAuthCredentials } from '@/utils/auth-utils';
import { useIsRTL } from '@/utils/locals';
import usePrice from '@/utils/use-price';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect } from 'react';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type IProps = {
  orders: Order[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

const OrderList = ({
  orders,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
}: IProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const rowExpandable = (record: any) => record.children?.length;
  const { alignLeft, alignRight } = useIsRTL();
  const { permissions } = getAuthCredentials();
  const { mutate: createConversations, isLoading: creating } =
    useCreateConversations();
  const [loading, setLoading] = useState<boolean | string | undefined>(false);
  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: string | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });

  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
   const [status, setStatus] = useState('publish'); // Default to "publish"
   const [ordersUpdated, setOrdersUpdated] = useState(false);

  const onHeaderClick = (column: string | null) => ({
    onClick: () => {
      onSort((currentSortDirection: SortOrder) =>
        currentSortDirection === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc
      );
      onOrder(column!);

      setSortingObj({
        sort:
          sortingObj.sort === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
        column: column,
      });
    },
  });

  const handleSelectOrder = (id: number) => {
    setSelectedOrders((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((orderId) => orderId !== id)
        : [...prevSelected, id]
    );
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value); // Update the selected status
  };

  const handleDelete = () => {
    console.log("Deleting Orders:", selectedOrders);
    // Implement delete logic here
  };

  const handleDisable = async () => {
    const url = 'https://fun2sh.deificindia.com/orders/multiupdate';
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': `XSRF-TOKEN=eyJpdiI6ImE1VDV4OVlHTnA1VUpNR0RQZk9IUWc9PSIsInZhbHVlIjoiOU9UaU44eXpnK2JtVHR0VFdoam5jQlJET0kzanhIYzQydUMxMFpXcjAvNjRnUVJOY0Q2UGg0aDA2c0hhQXAra0xjS3lFV1Z3ejg0aFVIWFlqL0lLSHB6dGx4NitKRjVGOHhLc292a2VkK0xzYnNLamQzSzVnYmFJSGdBYTZaQmIiLCJtYWMiOiIwNDE4MWQxN2FkYWQ3ZDBmYWY3YTdjNTE1NWFiODAzNmU2ZDYxYzliZDlhMjc1MWYxMDAxMGY1ZmEzYjA4Y2JlIiwidGFnIjoiIn0%3D; chawkbazar_session=eyJpdiI6IjdMYmxHdVpwNHgrUER6QmkwRHlQTFE9PSIsInZhbHVlIjoiYWRzWStndG1QeWU5cEZLWlVBTkxoV3N0T3pmY3JTd01Fc0R0UkUvcG9LT1BMUmpJSWZXdFBTdjdZcTVUUzRxekxkSERJdXl2cy9HdHZDWkNKTkNiRzdScG5pZ3hMYkdkbUFzNXNUZWRTeVpvaTRTQ0lTemUvMVRDVEJrTnlyNXYiLCJtYWMiOiI1ZDNhNmY1ZTRmMmJlNTlhYjZhMDhhNzAxNzBhNjMyYTRhOWI2YzQzOWZiMDQyZjFkNTRiMTM3ZDU0NjgwODVlIiwidGFnIjoiIn0%3D`,
    };
  
    // Sending data as an array
    const payload = {
      id: selectedOrders, // Array of selected product IDs
      order_status:status
    };

    

   
  
    try {
      const response = await axios.post(url, payload, { headers });
      console.log('API Response:', response.data);
      toast.success('Orders updated successfully!', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, // Auto close after 3 seconds
      });
      setOrdersUpdated(true);
    } catch (error) {
      console.error('Error occurred:', error.response || error.message);
      toast.error('An error occurred while updating orders.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, // Auto close after 3 seconds
      });
    }
  };
  useEffect(() => {
    if (ordersUpdated) {
      // Fetch or update UI here after products are updated
      console.log('Products updated. You can refresh the UI here.');
      setOrdersUpdated(false); // Reset state
    }
  }, [ordersUpdated]);

  

  const columns = [
    {
      title: (
        <input
          type="checkbox"
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedOrders(orders?.map(order => order.id) || []);
            } else {
              setSelectedOrders([]);
            }
          }}
          checked={selectedOrders.length === (orders?.length || 0)}
        />
      ),
      dataIndex: 'select',
      key: 'select',
      align: 'center',
      width: 50,
      render: (text: any, record: Order) => (
        <input
          type="checkbox"
          checked={selectedOrders.includes(record.id)}
          onChange={() => handleSelectOrder(record.id)}
        />
      ),
    },
    {
      title: t('table:table-item-tracking-number'),
      dataIndex: 'tracking_number',
      key: 'tracking_number',
      align: alignLeft,
      width: 200,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-customer')}
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'name'
          }
          isActive={sortingObj.column === 'name'}
        />
      ),
      dataIndex: 'customer',
      key: 'name',
      align: alignLeft,
      width: 250,
      onHeaderCell: () => onHeaderClick('name'),
      render: (customer: any) => (
        <div className="flex items-center">
          <Avatar name={customer?.name} />
          <div className="flex flex-col whitespace-nowrap font-medium ms-2">
            {customer?.name ? customer?.name : t('common:text-guest')}
            <span className="text-[13px] font-normal text-gray-500/80">
              {customer?.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: t('table:table-item-products'),
      dataIndex: 'products',
      key: 'products',
      align: 'center',
      render: (products: Product) => <span>{products.length}</span>,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-order-date')}
          ascending={
            sortingObj?.sort === SortOrder?.Asc &&
            sortingObj?.column === 'created_at'
          }
          isActive={sortingObj?.column === 'created_at'}
          className="cursor-pointer"
        />
      ),
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      onHeaderCell: () => onHeaderClick('created_at'),
      render: (date: string) => {
        dayjs.extend(relativeTime);
        dayjs.extend(utc);
        dayjs.extend(timezone);
        return (
          <span className="whitespace-nowrap">
            {dayjs.utc(date).tz(dayjs.tz.guess()).fromNow()}
          </span>
        );
      },
    },
    {
      title: t('table:table-item-delivery-fee'),
      dataIndex: 'delivery_fee',
      key: 'delivery_fee',
      align: 'center',
      render: function Render(value: any) {
        const delivery_fee = value ? value : 0;
        const { price } = usePrice({
          amount: delivery_fee,
        });
        return <span>{price}</span>;
      },
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-total')}
          ascending={
            sortingObj?.sort === SortOrder?.Asc &&
            sortingObj?.column === 'total'
          }
          isActive={sortingObj?.column === 'total'}
          className="cursor-pointer"
        />
      ),
      dataIndex: 'total',
      key: 'total',
      align: 'center',
      width: 120,
      onHeaderCell: () => onHeaderClick('total'),
      render: function Render(value: any) {
        const { price } = usePrice({
          amount: value,
        });
        return <span className="whitespace-nowrap">{price}</span>;
      },
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'order_status',
      key: 'order_status',
      align: 'center',
      render: (order_status: string) => (
        <Badge text={t(order_status)} color={StatusColor(order_status)} />
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: alignRight,
      width: 120,
      render: (id: string, order: Order) => (
        <ActionButtons
          id={id}
          detailsUrl={`${router.asPath}/${id}`}
          customLocale={order.language}
        />
      ),
    },
  ];

  return (
    <>
      {selectedOrders.length > 0 && (

<>
       <div className="mb-6 p-6 border border-gray-300 rounded-lg bg-white shadow-md">
 <h3 className="text-xl font-bold text-gray-800 mb-4">Selected Products Actions</h3>
 <div className="flex items-center space-x-6">
   <div>
     <label 
       htmlFor="statusSelect" 
       className="block text-sm font-medium text-gray-600 mb-2"
     >
       Select Status:
     </label>
     <select
  id="statusSelect"
  value={status}
  onChange={handleStatusChange}
  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
>
  <option value="order-pending">Order Pending</option>
  <option value="order-processing">Order Processing</option>
  <option value="order-at-local-facility">Order at Local Facility</option>
  <option value="order-out-for-delivery">Order Out For Delivery</option>
  <option value="order-completed">Order Completed</option>
</select>
   </div>
   <button
     className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
     onClick={handleDisable}
   >
     Change Status
   </button>
 </div>
</div>

       
       </>
       
     )}
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          //@ts-ignore
          columns={columns}
          emptyText={() => (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className ="w-52" />
              <div className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={orders}
          rowKey="id"
          scroll={{ x: 1000 }}
          expandable={{
            expandedRowRender: () => '',
            rowExpandable: rowExpandable,
          }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo?.total}
            current={paginatorInfo?.currentPage}
            pageSize={paginatorInfo?.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default OrderList;