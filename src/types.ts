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

export interface RegionalData {
  id: number;
  regionCode: string;
  regionName: string;
  scenario: Scenario;
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

export interface Claim {
  id: string;
  regionCode: string;
  serialNumber: string;
  region: string;
  branch: string;
  employeeId: string;
  name: string;
  personnelType: string;
  outsourcingCompany: string;
  position: string;
  occurrenceTime: string;
  hasSocialSecurity: boolean;
  isWorkInjury: boolean;
  anomalyDescription: string;
  accidentLocation: string;
  anomalyCode: string;
  anomalyLevel: string;
  isDelayedReporting: boolean;
  casualtyType: string;
  isMarried: boolean;
  childrenStatus: string;
  parentsStatus: string;
  socialSecurityPayout: number;
  sapInsurancePayout: number;
  pmpInsurancePayout: number;
  otherInsurancePayout: number;
  humanitarianAmount: number;
  organizationBearingAmount: number;
  supplierBearingAmount: number;
  platformBearingAmount: number;
  statutoryPayoutStandard: number;
}

export interface Recommendation {
  planName: string;
  suggestedCoverage: number;
  expectedRiskReduction: number;
  additionalPremium: number;
}
