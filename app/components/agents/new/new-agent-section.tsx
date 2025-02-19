"use client";

import { Agent } from "@/mongodb/models/agent";
import { NewAgentRequestData } from "@/types/new-agent-request-data";
import { useState } from "react";
import { NewAgentCreatedSection } from "./new-agent-created-section";
import { NewAgentDefineAddressBookSection } from "./new-agent-define-address-book-section";
import { NewAgentDefinePersonalitySection } from "./new-agent-define-personality-section";
import { NewAgentDefineTwitterSection } from "./new-agent-define-twitter-section";
import { NewAgentDefineUserSection } from "./new-agent-define-user-section";
import { NewAgentFinalStepSection } from "./new-agent-final-step-section";

export function NewAgentSection() {
  const [newAgenRequesttData, setNewAgentRequestData] =
    useState<NewAgentRequestData>({});
  const [newAgent, setNewAgent] = useState<Agent | undefined>();

  if (!newAgenRequesttData.user) {
    return (
      <NewAgentDefineUserSection
        newAgentRequestData={newAgenRequesttData}
        onNewAgentRequestDataUpdate={(newAgentRequestData) =>
          setNewAgentRequestData(newAgentRequestData)
        }
      />
    );
  }

  if (!newAgenRequesttData.personality) {
    return (
      <NewAgentDefinePersonalitySection
        newAgentRequestData={newAgenRequesttData}
        onNewAgentRequestDataUpdate={(newAgentRequestData) =>
          setNewAgentRequestData(newAgentRequestData)
        }
      />
    );
  }

  if (!newAgenRequesttData.addressBook) {
    return (
      <NewAgentDefineAddressBookSection
        newAgentRequestData={newAgenRequesttData}
        onNewAgentRequestDataUpdate={(newAgentRequestData) =>
          setNewAgentRequestData(newAgentRequestData)
        }
      />
    );
  }

  if (!newAgenRequesttData.twitter) {
    return (
      <NewAgentDefineTwitterSection
        newAgentRequestData={newAgenRequesttData}
        onNewAgentRequestDataUpdate={(newAgentRequestData) =>
          setNewAgentRequestData(newAgentRequestData)
        }
      />
    );
  }

  if (!newAgent) {
    return (
      <NewAgentFinalStepSection
        newAgentRequestData={newAgenRequesttData}
        onAgentDefine={(agent) => setNewAgent(agent)}
      />
    );
  }

  return <NewAgentCreatedSection newAgent={newAgent} />;
}
