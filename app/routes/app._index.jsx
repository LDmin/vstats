import { useEffect } from "react";
import { json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  ResourceList,
  Link,
  DataTable,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const carrierServices = await admin.rest.resources.CarrierService.all({
    session: session,
  });

  return json({ carrierServices });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
          variants: [{ price: Math.random() * 100 }],
        },
      },
    },
  );
  const responseJson = await response.json();

  return json({
    product: responseJson.data?.productCreate?.product,
  });
};

export default function Index() {
  const { carrierServices } = useLoaderData();
  const rows = carrierServices.data.map((d) => [
    d.id,
    d.name,
    d.carrier_service_type,
    d.admin_graphql_api_id,
    d.callback_url,
    d.format,
    d.service_discovery,
    d.active,
  ]);

  return (
    <Page>
      <DataTable
        columnContentTypes={[
          "numeric",
          "numeric",
          "numeric",
          "numeric",
          "numeric",
        ]}
        headings={[
          "id",
          "name",
          "carrier_service_type",
          "admin_graphql_api_id",
          "callback_url",
          "format",
          "service_discovery",
          "active",
        ]}
        rows={rows}
      />
    </Page>
  );
}
