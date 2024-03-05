import { useState } from "react";
import { json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  Form,
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
  FormLayout,
  Checkbox,
  TextField,
  Button,
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
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();

  const name = formData.get("name");
  const callback_url = formData.get("callback_url");

  const carrier_service = new admin.rest.resources.CarrierService({
    session: session,
  });
  carrier_service.name = name;
  carrier_service.callback_url = callback_url;
  carrier_service.service_discovery = true;
  const carrier_service_rs = await carrier_service.save({
    update: true,
  });
  return json({
    carrier_service: carrier_service_rs,
  });
};

export default function Index() {
  const { carrierServices } = useLoaderData();
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [callback_url, setCallback_url] = useState("");
  const data = useActionData();
  console.log({ data });

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

  const isLoading = navigation.state === "submitting";

  const submit = useSubmit();

  const handleSubmit = () => {
    submit({ name, callback_url }, { method: "post" });
  };

  return (
    <Page
      title="Carrier Service"
      primaryAction={{
        content: "Save",
        loading: isLoading,
        onAction: handleSubmit,
      }}
    >
      <Form method="post">
        <FormLayout>
          <FormLayout.Group>
            <TextField
              name="name"
              type="text"
              label="name"
              value={name}
              onChange={setName}
              disabled={isLoading}
              requiredIndicator
              autoComplete="on"
            />
            <TextField
              name="callback_url"
              type="text"
              label="callback_url"
              value={callback_url}
              onChange={setCallback_url}
              disabled={isLoading}
              requiredIndicator
              autoComplete="off"
            />
          </FormLayout.Group>
        </FormLayout>
      </Form>
      <DataTable
        columnContentTypes={[
          "numeric",
          "numeric",
          "numeric",
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
