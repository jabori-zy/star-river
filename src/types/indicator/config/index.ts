// Unified export file for all indicator configurations

// Overlap Studies - 16 indicators
export * from "./overlap";

import type {
	BBANDSConfigType,
	DEMAConfigType,
	EMAConfigType,
	HtTrendlineConfigType,
	KAMAConfigType,
	MAConfigType,
	MAMAConfigType,
	MIDPOINTConfigType,
	MIDPRICEConfigType,
	SARConfigType,
	SAREXTConfigType,
	SMAConfigType,
	T3ConfigType,
	TEMAConfigType,
	TRIMAConfigType,
	WMAConfigType,
} from "./overlap";

// Momentum Indicators - 30 indicators
export * from "./momentum";

import type {
	ADXConfigType,
	ADXRConfigType,
	APOConfigType,
	AROONConfigType,
	AROONOSCConfigType,
	BOPConfigType,
	CCIConfigType,
	CMOConfigType,
	DXConfigType,
	MACDConfigType,
	MACDEXTConfigType,
	MACDFIXConfigType,
	MFIConfigType,
	MinusDiConfigType,
	MinusDmConfigType,
	MOMConfigType,
	PlusDiConfigType,
	PlusDmConfigType,
	PPOConfigType,
	ROCConfigType,
	ROCPConfigType,
	ROCR100ConfigType,
	ROCRConfigType,
	RSIConfigType,
	STOCHConfigType,
	STOCHFConfigType,
	STOCHRSIConfigType,
	TRIXConfigType,
	ULTOSCConfigType,
	WILLRConfigType,
} from "./momentum";

// Volume Indicators - 3 indicators
export * from "./volume";

import type { ADConfigType, ADOSCConfigType, OBVConfigType } from "./volume";

// Volatility Indicators - 3 indicators
export * from "./volatility";

import type {
	ATRConfigType,
	NATRConfigType,
	TRANGEConfigType,
} from "./volatility";

// Cycle Indicators - 5 indicators
export * from "./cycle";

import type {
	HtDcperiodConfigType,
	HtDcphaseConfigType,
	HtPhasorConfigType,
	HtSineConfigType,
	HtTrendmodeConfigType,
} from "./cycle";

// Price Transform Indicators - 4 indicators
export * from "./price_transform";

import type {
	AVGPRICEConfigType,
	MEDPRICEConfigType,
	TYPPRICEConfigType,
	WCLPRICEConfigType,
} from "./price_transform";

// Pattern Recognition Indicators - 61 indicators
export * from "./pattern_recognition";

import type {
	CDL2CROWSConfigType,
	CDL3BLACKCROWSConfigType,
	CDL3INSIDEConfigType,
	CDL3LINESTRIKEConfigType,
	CDL3OUTSIDEConfigType,
	CDL3STARSINSOUTHConfigType,
	CDL3WHITESOLDIERSConfigType,
	CDLABANDONEDBABYConfigType,
	CDLADVANCEBLOCKConfigType,
	CDLBELTHOLDConfigType,
	CDLBREAKAWAYConfigType,
	CDLCLOSINGMARUBOZUConfigType,
	CDLCONCEALBABYSWALLConfigType,
	CDLCOUNTERATTACKConfigType,
	CDLDARKCLOUDCOVERConfigType,
	CDLDOJIConfigType,
	CDLDOJISTARConfigType,
	CDLDRAGONFLYDOJIConfigType,
	CDLENGULFINGConfigType,
	CDLEVENINGDOJISTARConfigType,
	CDLEVENINGSTARConfigType,
	CDLGAPSIDESIDEWHITEConfigType,
	CDLGRAVESTONEDOJIConfigType,
	CDLHAMMERConfigType,
	CDLHANGINGMANConfigType,
	CDLHARAMIConfigType,
	CDLHARAMICROSSConfigType,
	CDLHIGHWAVEConfigType,
	CDLHIKKAKEConfigType,
	CDLHIKKAKEMODConfigType,
	CDLHOMINGPIGEONConfigType,
	CDLIDENTICAL3CROWSConfigType,
	CDLINNECKConfigType,
	CDLINVERTEDHAMMERConfigType,
	CDLKICKINGBYLENGTHConfigType,
	CDLKICKINGConfigType,
	CDLLADDERBOTTOMConfigType,
	CDLLONGLEGGEDDOJIConfigType,
	CDLLONGLINEConfigType,
	CDLMARUBOZUConfigType,
	CDLMATCHINGLOWConfigType,
	CDLMATHOLDConfigType,
	CDLMORNINGDOJISTARConfigType,
	CDLMORNINGSTARConfigType,
	CDLONNECKConfigType,
	CDLPIERCINGConfigType,
	CDLRICKSHAWMANConfigType,
	CDLRISEFALL3METHODSConfigType,
	CDLSEPARATINGLINESConfigType,
	CDLSHOOTINGSTARConfigType,
	CDLSHORTLINEConfigType,
	CDLSPINNINGTOPConfigType,
	CDLSTALLEDPATTERNConfigType,
	CDLSTICKSANDWICHConfigType,
	CDLTAKURIConfigType,
	CDLTASUKIGAPConfigType,
	CDLTHRUSTINGConfigType,
	CDLTRISTARConfigType,
	CDLUNIQUE3RIVERConfigType,
	CDLUPSIDEGAP2CROWSConfigType,
	CDLXSIDEGAP3METHODSConfigType,
} from "./pattern_recognition";

// All Indicator Configuration Union Type
export type IndicatorConfigType =
	// Overlap Studies (16 indicators)
	| BBANDSConfigType
	| DEMAConfigType
	| EMAConfigType
	| HtTrendlineConfigType
	| KAMAConfigType
	| MAConfigType
	| MAMAConfigType
	| MIDPOINTConfigType
	| MIDPRICEConfigType
	| SARConfigType
	| SAREXTConfigType
	| SMAConfigType
	| T3ConfigType
	| TEMAConfigType
	| TRIMAConfigType
	| WMAConfigType
	// Momentum Indicators (30 indicators)
	| ADXConfigType
	| ADXRConfigType
	| APOConfigType
	| AROONConfigType
	| AROONOSCConfigType
	| BOPConfigType
	| CCIConfigType
	| CMOConfigType
	| DXConfigType
	| MACDConfigType
	| MACDEXTConfigType
	| MACDFIXConfigType
	| MFIConfigType
	| MinusDiConfigType
	| MinusDmConfigType
	| MOMConfigType
	| PlusDiConfigType
	| PlusDmConfigType
	| PPOConfigType
	| ROCConfigType
	| ROCPConfigType
	| ROCRConfigType
	| ROCR100ConfigType
	| RSIConfigType
	| STOCHConfigType
	| STOCHFConfigType
	| STOCHRSIConfigType
	| TRIXConfigType
	| ULTOSCConfigType
	| WILLRConfigType
	// Volume Indicators (3 indicators)
	| ADConfigType
	| ADOSCConfigType
	| OBVConfigType
	// Volatility Indicators (3 indicators)
	| ATRConfigType
	| NATRConfigType
	| TRANGEConfigType
	// Cycle Indicators (5 indicators)
	| HtDcperiodConfigType
	| HtDcphaseConfigType
	| HtPhasorConfigType
	| HtSineConfigType
	| HtTrendmodeConfigType
	// Price Transform Indicators (4 indicators)
	| AVGPRICEConfigType
	| MEDPRICEConfigType
	| TYPPRICEConfigType
	| WCLPRICEConfigType
	// Pattern Recognition Indicators (61 indicators)
	| CDL2CROWSConfigType
	| CDL3BLACKCROWSConfigType
	| CDL3INSIDEConfigType
	| CDL3LINESTRIKEConfigType
	| CDL3OUTSIDEConfigType
	| CDL3STARSINSOUTHConfigType
	| CDL3WHITESOLDIERSConfigType
	| CDLABANDONEDBABYConfigType
	| CDLADVANCEBLOCKConfigType
	| CDLBELTHOLDConfigType
	| CDLBREAKAWAYConfigType
	| CDLCLOSINGMARUBOZUConfigType
	| CDLCONCEALBABYSWALLConfigType
	| CDLCOUNTERATTACKConfigType
	| CDLDARKCLOUDCOVERConfigType
	| CDLDOJIConfigType
	| CDLDOJISTARConfigType
	| CDLDRAGONFLYDOJIConfigType
	| CDLENGULFINGConfigType
	| CDLEVENINGDOJISTARConfigType
	| CDLEVENINGSTARConfigType
	| CDLGAPSIDESIDEWHITEConfigType
	| CDLGRAVESTONEDOJIConfigType
	| CDLHAMMERConfigType
	| CDLHANGINGMANConfigType
	| CDLHARAMIConfigType
	| CDLHARAMICROSSConfigType
	| CDLHIGHWAVEConfigType
	| CDLHIKKAKEConfigType
	| CDLHIKKAKEMODConfigType
	| CDLHOMINGPIGEONConfigType
	| CDLIDENTICAL3CROWSConfigType
	| CDLINNECKConfigType
	| CDLINVERTEDHAMMERConfigType
	| CDLKICKINGConfigType
	| CDLKICKINGBYLENGTHConfigType
	| CDLLADDERBOTTOMConfigType
	| CDLLONGLEGGEDDOJIConfigType
	| CDLLONGLINEConfigType
	| CDLMARUBOZUConfigType
	| CDLMATCHINGLOWConfigType
	| CDLMATHOLDConfigType
	| CDLMORNINGDOJISTARConfigType
	| CDLMORNINGSTARConfigType
	| CDLONNECKConfigType
	| CDLPIERCINGConfigType
	| CDLRICKSHAWMANConfigType
	| CDLRISEFALL3METHODSConfigType
	| CDLSEPARATINGLINESConfigType
	| CDLSHOOTINGSTARConfigType
	| CDLSHORTLINEConfigType
	| CDLSPINNINGTOPConfigType
	| CDLSTALLEDPATTERNConfigType
	| CDLSTICKSANDWICHConfigType
	| CDLTAKURIConfigType
	| CDLTASUKIGAPConfigType
	| CDLTHRUSTINGConfigType
	| CDLTRISTARConfigType
	| CDLUNIQUE3RIVERConfigType
	| CDLUPSIDEGAP2CROWSConfigType
	| CDLXSIDEGAP3METHODSConfigType;
