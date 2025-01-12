import Pagination from '@/components/ui/pagination';
import Image from 'next/image';
import { Table } from '@/components/ui/table';
import { siteSettings } from '@/settings/site.settings';
import usePrice from '@/utils/use-price';
import Badge from '@/components/ui/badge/badge';
import { Router, useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NoDataFound } from '@/components/icons/no-data-found';
import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Product,
  MappedPaginatorInfo,
  ProductType,
  Shop,
  SortOrder,
} from '@/types';
import { useIsRTL } from '@/utils/locals';
import { useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Routes } from '@/config/routes';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import axios from 'axios';

export type IProps = {
  products: Product[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

type SortingObjType = {
  sort: SortOrder;
  column: string | null;
};

const ProductList = ({
  products,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
}: IProps) => {
  const router = useRouter();
  const {
    query: { shop },
  } = router;
  const { t } = useTranslation();
  const { alignLeft, alignRight } = useIsRTL();

  const [sortingObj, setSortingObj] = useState<SortingObjType>({
    sort: SortOrder.Desc,
    column: null,
  });

  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [status, setStatus] = useState('publish'); // Default to "publish"
  const [productsUpdated, setProductsUpdated] = useState(false);

  const handleStatusChange = (event) => {
    setStatus(event.target.value); // Update the selected status
  };

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

  const handleSelectProduct = (id: number) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((productId) => productId !== id)
        : [...prevSelected, id]
    );
  };

  const handleActionOnSelectedProducts = () => {
    // Implement the action you want to perform on selected products
    console.log("Selected Products IDs:", selectedProducts);
  };

  let columns = [
    {
      title: (
        <input
          type="checkbox"
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProducts(products?.map(product => product.id) || []);
            } else {
              setSelectedProducts([]);
            }
          }}
          checked={selectedProducts.length === (products?.length || 0)}
        />
      ),
      dataIndex: 'select',
      key: 'select',
      align: 'center',
      width: 50,
      render: (text: any, record: Product) => (
        <input
          type="checkbox"
          checked={selectedProducts.includes(record.id)}
          onChange={() => handleSelectProduct(record.id)}
        />
      ),
    },
    {
      title: t('table:table-item-id'),
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 130,
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-product')}
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'name'
          }
          isActive={sortingObj.column === 'name'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      width: 280,
      ellipsis: true,
      onHeaderCell: () => onHeaderClick('name'),
      render: ( name: string, { image, type }: { image: any; type: any }) => (
        <div className="flex items-center">
          <div className="relative aspect-square h-10 w-10 shrink-0 overflow-hidden rounded border border-border-200/80 bg-gray-100 me-2.5">
            <Image
              src={image?.thumbnail ?? siteSettings.product.placeholder}
              alt={name}
              fill
              priority={true}
              sizes="(max-width: 768px) 100vw"
            />
          </div>
          <div className="flex flex-col">
            <span className="truncate font-medium">{name}</span>
            <span className="truncate whitespace-nowrap pt-1 pb-0.5 text-[13px] text-body/80">
              {type?.name}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: t('table:table-item-product-type'),
      dataIndex: 'product_type',
      key: 'product_type',
      width: 150,
      align: alignLeft,
      render: (product_type: string) => (
        <span className="truncate whitespace-nowrap capitalize">
          {product_type}
        </span>
      ),
    },
    {
      title: t('table:table-item-shop'),
      dataIndex: 'shop',
      key: 'shop',
      width: 170,
      align: alignLeft,
      ellipsis: true,
      render: (shop: Shop) => (
        <div className="flex items-center font-medium">
          <div className="relative aspect-square h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border-200/80 bg-gray-100 me-2">
            <Image
              src={shop?.logo?.thumbnail ?? siteSettings.product.placeholder}
              alt={shop?.name ?? 'Shop Name'}
              fill
              priority={true}
              sizes="(max-width: 768px) 100vw"
            />
          </div>
          <span className="truncate">{shop?.name}</span>
        </div>
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-unit')}
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'price'
          }
          isActive={sortingObj.column === 'price'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'price',
      key: 'price',
      align: alignRight,
      width: 180,
      onHeaderCell: () => onHeaderClick('price'),
      render: function Render(value: number, record: Product) {
        const { price: max_price } = usePrice({
          amount: record?.max_price as number,
        });
        const { price: min_price } = usePrice({
          amount: record?.min_price as number,
        });

        const { price } = usePrice({
          amount: value,
        });

        const renderPrice =
          record?.product_type === ProductType.Variable
            ? `${min_price} - ${max_price}`
            : price;

        return (
          <span className="whitespace-nowrap" title={renderPrice}>
            {renderPrice}
          </span>
        );
      },
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-quantity')}
          ascending={
            sortingObj.sort === SortOrder.Asc &&
            sortingObj.column === 'quantity'
          }
          isActive={sortingObj.column === 'quantity'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 170,
      onHeaderCell: () => onHeaderClick('quantity'),
      render: (quantity: number) => {
        if (quantity < 1) {
          return (
            <Badge
              text={t('common:text-out-of-stock')}
              color="bg-status-failed/10 text-status-failed"
              className="capitalize"
            />
          );
        }
        return <span>{quantity}</span>;
      },
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'status',
      key: 'status',
      align: 'left',
      width: 200,
      render: (status: string, record: any) => (
        <div
          className={`flex justify-start ${
            record?.quantity > 0 && record?.quantity < 10
              ? 'flex-col items-baseline space-y-2 3xl:flex-row 3xl:space-x-2 3xl:space-y-0 rtl:3xl:space-x -reverse'
              : 'items-center space-x-2 rtl:space-x-reverse'
          }`}
        >
          <Badge
            text={status}
            color={
              status.toLocaleLowerCase() === 'draft'
                ? 'bg-yellow-400/10 text-yellow-500'
                : 'bg-accent bg-opacity-10 !text-accent'
            }
            className="capitalize"
          />
          {record?.quantity > 0 && record?.quantity < 10 && (
            <Badge
              text={t('common:text-low-quantity')}
              color="bg-status-failed/10 text-status-failed"
              animate={true}
              className="capitalize"
            />
          )}
        </div>
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'slug',
      key: 'actions',
      align: 'right',
      width: 120,
      render: (slug: string, record: Product) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_PRODUCT"
          routes={Routes?.product}
          enablePreviewMode={true}
          isShop={Boolean(shop)}
          shopSlug={(shop as string) ?? ''}
        />
      ),
    },
  ];

  if (router?.query?.shop) {
    columns = columns?.filter((column) => column?.key !== 'shop');
  }


  const handleDisable = async () => {
    const url = 'https://fun2sh.deificindia.com/products/multiupdate';
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': `XSRF-TOKEN=eyJpdiI6ImE1VDV4OVlHTnA1VUpNR0RQZk9IUWc9PSIsInZhbHVlIjoiOU9UaU44eXpnK2JtVHR0VFdoam5jQlJET0kzanhIYzQydUMxMFpXcjAvNjRnUVJOY0Q2UGg0aDA2c0hhQXAra0xjS3lFV1Z3ejg0aFVIWFlqL0lLSHB6dGx4NitKRjVGOHhLc292a2VkK0xzYnNLamQzSzVnYmFJSGdBYTZaQmIiLCJtYWMiOiIwNDE4MWQxN2FkYWQ3ZDBmYWY3YTdjNTE1NWFiODAzNmU2ZDYxYzliZDlhMjc1MWYxMDAxMGY1ZmEzYjA4Y2JlIiwidGFnIjoiIn0%3D; chawkbazar_session=eyJpdiI6IjdMYmxHdVpwNHgrUER6QmkwRHlQTFE9PSIsInZhbHVlIjoiYWRzWStndG1QeWU5cEZLWlVBTkxoV3N0T3pmY3JTd01Fc0R0UkUvcG9LT1BMUmpJSWZXdFBTdjdZcTVUUzRxekxkSERJdXl2cy9HdHZDWkNKTkNiRzdScG5pZ3hMYkdkbUFzNXNUZWRTeVpvaTRTQ0lTemUvMVRDVEJrTnlyNXYiLCJtYWMiOiI1ZDNhNmY1ZTRmMmJlNTlhYjZhMDhhNzAxNzBhNjMyYTRhOWI2YzQzOWZiMDQyZjFkNTRiMTM3ZDU0NjgwODVlIiwidGFnIjoiIn0%3D`,
    };
  
    // Sending data as an array
    const payload = {
      id: selectedProducts, // Array of selected product IDs
      status
    };
  
    try {
      const response = await axios.post(url, payload, { headers });
      console.log('API Response:', response.data);
      toast.success('Products updated successfully!', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, // Auto close after 3 seconds
      });
      setProductsUpdated(true);
    } catch (error) {
      console.error('Error occurred:', error.response || error.message);
      toast.error('An error occurred while updating products.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, // Auto close after 3 seconds
      });
    }
  };


  useEffect(() => {
    if (productsUpdated) {
      // Fetch or update UI here after products are updated
      console.log('Products updated. You can refresh the UI here.');
      setProductsUpdated(false); // Reset state
    }
  }, [productsUpdated]);
  
  
  




  // Run only once when the component loads
  return (
    <>

{selectedProducts.length > 0 && (

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
        <option value="publish">Published</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="soft_disabled">Soft Disabled</option>
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
          /* @ts-ignore */
          columns={columns}
          emptyText={() => (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={products}
          rowKey="id"
          scroll={{ x: 900 }}
        />
      </div>

      {/* <button onClick={handleActionOnSelectedProducts} className="mb-4 p-2 bg-blue-500 text-white rounded">
        Perform Action on Selected Products
      </button> */}

    

      

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
            showLessItems
          />
        </div>
      )}
    </>
  );
};

export default ProductList;