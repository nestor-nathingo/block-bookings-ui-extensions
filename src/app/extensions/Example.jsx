import React, { useState } from "react";
import {
  Divider,
  Link,
  Button,
  Text,
  Input,
  Flex,
  hubspot,
} from "@hubspot/ui-extensions";
import { HubExtension, DealValidation } from "./components/block-bookings";

// Define the extension to be run within the Hubspot CRM
hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <>
    {/* <HubExtension
      context={context}
      runServerless={runServerlessFunction}
      sendAlert={actions.addAlert}
    /> */}
    <DealValidation
      context={context}
      runServerless={runServerlessFunction}
      sendAlert={actions.addAlert}
    />
  </>
));