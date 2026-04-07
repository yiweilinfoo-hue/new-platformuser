export enum Scenario {
  SCENARIO_1 = "情形一",
  SCENARIO_2 = "情形二",
  SCENARIO_3 = "情形三",
  SCENARIO_4 = "情形四",
}

export enum ViewType {
  GROUP = "集团",
  BUSINESS = "业务区",
  DISTRIBUTION = "分拨区",
}

export enum BusinessCategory {
  COLLECTION_DELIVERY = "平台收派",
  OPERATION_SAP = "平台运作SAP",
  OPERATION_PMP = "平台运作PMP",
}

export interface RegionalData {
  id: number;
  regionCode: string;
  regionName: string;
  scenario: Scenario;
  businessCategory: BusinessCategory;
  basePremium: number;
  baseLossRatio: number;
  extraCost: number;
  sapPayout: number;
  pmpPayout: number;
  companyPayout: number;
  supplierPayout: number;
  totalPayout: number;
  estimatedRiskFund: number;
  optimizationDirection: string;
}

export enum EventStatus {
  COMPLETED = "已完结",
  IN_PROGRESS = "未完结",
}

export interface Claim {
  id: string;
  regionCode: string;
  businessCategory: BusinessCategory;
  eventStatus: EventStatus;
  employeeId: string;
  name: string;
  personnelType: string;
  costCenter: string;
  position: string;
  supplierName: string;
  occurrenceTime: string;
  anomalyCode: string;
  isWorkInjury: boolean;
  totalPayout: number;
  employerInsurancePayout: number;
  medicalInsurancePayout: number;
  platformPayout: number;
  supplierPayout: number;
  regionalPayout: number;
  statutoryPayoutStandard: number;
}

export interface Recommendation {
  planName: string;
  suggestedCoverage: number;
  expectedRiskReduction: number;
  additionalPremium: number;
}
