// 指标配置统一导出文件
// Unified export file for all indicator configurations

// 重叠指标 (Overlap Studies) - 16个指标
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

// 动量指标 (Momentum Indicators) - 30个指标
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
	ROCRConfigType,
	ROCR100ConfigType,
	RSIConfigType,
	STOCHConfigType,
	STOCHFConfigType,
	STOCHRSIConfigType,
	TRIXConfigType,
	ULTOSCConfigType,
	WILLRConfigType,
} from "./momentum";

// 成交量指标 (Volume Indicators) - 3个指标
export * from "./volume";
import type {
	ADConfigType,
	ADOSCConfigType,
	OBVConfigType,
} from "./volume";

// 波动性指标 (Volatility Indicators) - 3个指标
export * from "./volatility";
import type {
	ATRConfigType,
	NATRConfigType,
	TRANGEConfigType,
} from "./volatility";

// 周期指标 (Cycle Indicators) - 5个指标
export * from "./cycle";
import type {
	HtDcperiodConfigType,
	HtDcphaseConfigType,
	HtPhasorConfigType,
	HtSineConfigType,
	HtTrendmodeConfigType,
} from "./cycle";

// 价格变换指标 (Price Transform Indicators) - 4个指标
export * from "./price_transform";
import type {
	AVGPRICEConfigType,
	MEDPRICEConfigType,
	TYPPRICEConfigType,
	WCLPRICEConfigType,
} from "./price_transform";

// K线形态识别指标 (Pattern Recognition Indicators) - 61个指标
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
	CDLKICKINGConfigType,
	CDLKICKINGBYLENGTHConfigType,
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

// 指标配置联合类型 (All Indicator Configuration Union Type)
export type IndicatorConfigType =
	// 重叠指标 (16个)
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
	// 动量指标 (30个)
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
	// 成交量指标 (3个)
	| ADConfigType
	| ADOSCConfigType
	| OBVConfigType
	// 波动性指标 (3个)
	| ATRConfigType
	| NATRConfigType
	| TRANGEConfigType
	// 周期指标 (5个)
	| HtDcperiodConfigType
	| HtDcphaseConfigType
	| HtPhasorConfigType
	| HtSineConfigType
	| HtTrendmodeConfigType
	// 价格变换指标 (4个)
	| AVGPRICEConfigType
	| MEDPRICEConfigType
	| TYPPRICEConfigType
	| WCLPRICEConfigType
	// K线形态识别指标 (61个)
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