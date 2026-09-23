"use client";

import React, { useState, useEffect } from "react";
import { fetchSchoolInfo, fetchFeeStructure, fetchTransportRoutes } from "@/services/school";

import FeeHero from "@/components/fees/FeeHero";
import FeeTiersSection from "@/components/fees/FeeTiersSection";
import TransportRoutesSection from "@/components/fees/TransportRoutesSection";
import ScheduleAndConcessions from "@/components/fees/ScheduleAndConcessions";
import BankDetailsSection from "@/components/fees/BankDetailsSection";
import FeeDisabledNotice from "@/components/fees/FeeDisabledNotice";

export default function Fees() {
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [transportData, setTransportData] = useState(null);

  useEffect(() => {
    fetchSchoolInfo().then((data) => {
      if (data) setSchoolInfo(data);
    }).catch(err => console.error("[Fees] Error loading school info:", err));

    fetchFeeStructure().then((data) => {
      if (data) setFeeData(data);
    }).catch(err => console.error("[Fees] Error loading fee structure:", err));

    fetchTransportRoutes().then((data) => {
      if (data) setTransportData(data);
    }).catch(err => console.error("[Fees] Error loading transport routes:", err));
  }, []);

  // Small focused resolution from targeted API endpoints or schoolInfo config
  const showFeeStructure = feeData?.showFeeStructure ?? schoolInfo?.fee_structure_config?.showFeeStructure ?? true;
  const showTransportSlabs = transportData?.showTransportSlabs ?? schoolInfo?.fee_structure_config?.showTransportSlabs ?? true;
  const sessionTag = feeData?.sessionTag || schoolInfo?.fee_structure_config?.sessionTag || "SESSION 2026-27";
  const feeTiers = (feeData?.feeTiers && feeData.feeTiers.length > 0)
    ? feeData.feeTiers
    : (schoolInfo?.fee_structure_config?.feeTiers || []);
  const transportRoutes = (transportData?.transportRoutes && transportData.transportRoutes.length > 0)
    ? transportData.transportRoutes
    : (schoolInfo?.fee_structure_config?.transportRoutes || []);
  const bankDetails = feeData?.bankDetails || schoolInfo?.fee_structure_config?.bankDetails;
  const accountsPhone = feeData?.accountsPhone || schoolInfo?.fee_structure_config?.accountsPhone || schoolInfo?.contactPhone;

  return (
    <div className="bg-[#F8FAFC] min-h-screen selection:bg-[var(--primary)] selection:text-white text-[#0F172A] antialiased overflow-x-hidden pt-24 pb-36 font-sans">
      <FeeHero sessionTag={sessionTag} schoolName={schoolInfo?.schoolName || schoolInfo?.name} />

      {!showFeeStructure && !showTransportSlabs ? (
        <FeeDisabledNotice sessionTag={sessionTag} accountsPhone={accountsPhone} />
      ) : (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 space-y-24">
          {showFeeStructure && <FeeTiersSection feeTiers={feeTiers} />}
          {showTransportSlabs && <TransportRoutesSection transportRoutes={transportRoutes} />}
          <ScheduleAndConcessions accountsPhone={accountsPhone} />
          <BankDetailsSection bankDetails={bankDetails} />
        </div>
      )}
    </div>
  );
}
