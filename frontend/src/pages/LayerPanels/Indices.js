import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Divider, List } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelected,
  setSelectedTwo,
  setSelectedWapor,
} from "../../slices/mapView";

const Indices = ({
  setSelectedMin,
  setSelectedMax,
  setloadlayer,
  setshowGraph,
  setshowOpacity,
  setshowprecipitation,
  setshowmonths,
  setapplyBtn,
  setgraphBtn,
  setlegend,
  openNotificationWithIcon,
  setmodalMessage,
  setmodalopen,
  compare,
  setLayerURL,
}) => {
  const dispatch = useDispatch();

  const { darkmode, selected, selectedTwo } = useSelector((state) => state);
  const handleIndice = (e) => {
    // if (selected && selectedTwo) return;
    const item = data.find((entry) => entry.value === e);
    if (item) {
      setSelectedMin(item.min);
      setSelectedMax(item.max);
    }

    if (!compare) {
      setloadlayer(false);
      setshowOpacity(false);
      setshowGraph(false);
      setshowprecipitation(false);
      setshowmonths(false);
      dispatch(setSelectedWapor(null));
      setLayerURL([]);
      // Handle single selection
      if (e === selected) {
        setshowprecipitation(false);
        setshowmonths(false);
        setapplyBtn(true);
        setgraphBtn(false);
        setlegend(false);
        dispatch(setSelected(null));
      } else {
        setshowprecipitation(e === "extreme_rainfall" || e === "DrySpell");
        // Show months selector for SPI variants and RDI (WaPOR) time-scales
        setshowmonths(
          e === "SPI_CHIRPS" || e === "SPI_ERA5L" || e === "RDI_WAPOR"
        );
        if (e === "DrySpell" || e === "extreme_rainfall") {
          openNotificationWithIcon(
            "info",
            "Adjust precipitation threshold value",
            "",
            "bottomRight"
          );
        }
        setapplyBtn(false);
        setgraphBtn(e !== "DrySpell");
        // setlegend(false);
        dispatch(setSelected(e));
      }
    } else {
      setapplyBtn(false);
      dispatch(setSelectedTwo(e));
    }
  };

  const parentList = [
    "Agricultural Drought",
    "Meteorological Drought",
    "Impact",
  ];

  const data = [
    {
      title: "CDI",
      value: "CDI",
      disabled: false,
      category: "",
      detail: "",
      min: 1,
      max: 5,
    },
    {
      title: "CWD",
      value: "CWD",
      disabled: false,
      category: "Agricultural Drought",
      detail:
        '<div class="search-content-img discription-text"><p>Climate Water Deficit (CWD) is a critical measure used in agriculture to describe the difference between the water demand of a crop and the actual water available to it through precipitation or irrigation.</p><p>CWD=PET - ET</p><p><em><strong>Refrences:</strong> Singh, M., Singh, P., Singh, S. et al. A global meta-analysis of yield and water productivity responses of vegetables to deficit irrigation. Sci Rep 11, 22095 (2021). https://doi.org/10.1038/s41598-021-01433-w</em></p></div>',
      min: 0,
      max: 1,
    },
    {
      title: "DrySpell",
      value: "DrySpell",
      disabled: false,
      category: "Meteorological Drought",
      detail:
        '<div class="search-content-img discription-text"><p>A dry spell is defined as the number of consecutive days with a daily precipitation amount below a certain threshold, such as 0.1, 1, 5, 10 mm, preceded and followed by at least one day with rainfall exceeding the threshold. The app uses rainfall product from ERA5 to calculate the dry spell for specific time period ranging from few days to months.</p><p><em><strong>Reference:</strong> Suppiah, R. and Hennessy, K.J., 1998. Trends in total rainfall, heavy rain events and number of dry days in Australia, 1910-1990. International Journal of Climatology: A Journal of the Royal Meteorological Society, 18(10), pp.1141-1164.</em></p></div>',
      min: 0,
      max: 2,
    },
    {
      title: "MAI",
      value: "MAI",
      disabled: false,
      category: "Agricultural Drought",
      detail:
        '<div className="search-content-img discription-text"><p>MAI stands for Moisture Adequacy Index.<br>Moisture Adequacy Index (MAI) is the ratio of actual evapotranspiration (AET) to the potential evapotranspiration (PET). Thus, MAI represents moisture effectivity which has impact on vegetation in relation to the climate. The range of MAI values varies between 0-1; value near to 0 reveals extreme stress while 1 expresses ample amount of soil moisture availability. &nbsp;&nbsp;<br>MAI = AET/PET</p><p><em><strong>Reference:</strong> Thornthwaite, C.W. and Mather, J.R., 1955. The water balance publications in Climatology, 8 (1). DIT, Laboratory of climatology, Centerton, NJ, USA.</em></p></div>',
      min: 0.1,
      max: 0.5,
    },
    {
      title: "NDVI Anomaly",
      value: "NDVI_Anamoly",
      disabled: false,
      category: "Impact",
      detail:
        "<p>Normalized Deference Vegetation Index (NDVI) anomaly is the rate at which plants and other primary producers store energy as biomass. <br>NDVI Anomaly is a metric that quantifies the deviation of the observed Normalized Difference Vegetation Index (NDVI) from a reference or baseline NDVI value. In other words, it measures how much the current vegetation condition differs from what is considered normal based on historical data. Here's a more detailed breakdown:<br>NDVI (Anamoly) = [NDVI(i) - NDVI(mean)]/[NDVI(std)]<br><br><em><strong>Reference:</strong> Rouse Jr, J.W., Haas, R.H., Schell, J.A. and Deering, D.W., 1973. Monitoring the vernal advancement and retrogradation (green wave effect) of natural vegetation.</em></p>",
      min: -1,
      max: 1,
    },
    {
      title: "PCI",
      value: "PCI",
      disabled: false,
      category: "Meteorological Drought",
      detail:
        '<div class="search-content-img discription-text"><p>The Precipitation Condition Index (PCI) is a tool used in drought monitoring to directly respond to precipitation anomalies, making it essential for assessing agricultural drought.</p><p>PCI = [Precipitation(i) - Precipitation(min)]/[Precipitation(max) - Precipitation(min)]</p><p><em><strong>Refrences:</strong> Zhao, Y.; Zhang, J.; Bai, Y.; Zhang, S.; Yang, S.; Henchiri, M.; Seka, A.M.; Nanzad, L. Drought Monitoring and Performance Evaluation Based on Machine Learning Fusion of Multi-Source Remote Sensing Drought Factors. Remote Sens. 2022, 14, 6398. https://doi.org/10.3390/rs14246398</em></p></div>',
      min: 0,
      max: 1,
    },
    /*{
      title: "SMCI",
      value: "SMCI",
      disabled: false,
      category: "Agricultural Drought",
      detail:
        '<div class="search-content-img discription-text"><p>The Soil Moisture Condition Index (SMCI) is a drought index that quantifies soil moisture to monitor agricultural drought conditions. It is derived from soil moisture and precipitation data, offering a direct measure of the soils wetness or dryness. This index is crucial for understanding and managing the impact of drought on agriculture by providing insights into the current state of soil moisture, which is vital for crop growth and productivity. </p><p>SMCI = [Soil_Moisture(i) - Soil_Moisture(min)]/[Soil_Moisture(max) - Soil_Moisture(min)]</p><p><em><strong>Refrences:</strong> Sánchez, N.; González-Zamora, Á.; Piles, M.; Martínez-Fernández, J. A New Soil Moisture Agricultural Drought Index (SMADI) Integrating MODIS and SMOS Products: A Case of Study over the Iberian Peninsula. Remote Sens. 2016, 8, 287. https://doi.org/10.3390/rs8040287</em></p></div>',
      min: 0,
      max: 1,
    },*/
    // {
    //   title: "SPI (CHIRPS)",
    //   value: "SPI_CHIRPS",
    //   disabled: false,
    //   category: "Meteorological Drought",
    //   detail:
    //     '<div class="search-content-img discription-text"><p>The Standardized Precipitation Index (SPI) is a metric used globally to identify and measure drought intensity by analyzing precipitation deficits over multiple time scales. Developed in 1993 by McKee, Doesken, and Kleist, the SPI can assess conditions ranging from wet to dry, providing a standardized approach to compare drought severity</p><p><em><strong>Refrences:</strong> Mckee, T. B. and Nolan J. Doesken. “The Standardized Precipitation Index – an overview.” (2016).</em></p></div>',
    //   min: -3,
    //   max: 3,
    // },
    {
      title: "SPI (ERA5L)",
      value: "SPI_ERA5L",
      disabled: false,
      category: "Meteorological Drought",
      detail:
        '<div class="search-content-img discription-text"><p>The Standardized Precipitation Index (SPI) is a metric used globally to identify and measure drought intensity by analyzing precipitation deficits over multiple time scales. Developed in 1993 by McKee, Doesken, and Kleist, the SPI can assess conditions ranging from wet to dry, providing a standardized approach to compare drought severity</p><p><em><strong>Refrences:</strong> Mckee, T. B. and Nolan J. Doesken. “The Standardized Precipitation Index – an overview.” (2016).</em></p></div>',
      min: -3,
      max: 3,
    },
    {
      title: "TCI",
      value: "TCI",
      disabled: false,
      category: "Agricultural Drought",
      detail:
        '<div class="search-content-img discription-text"><p>The Temperature Condition Index (TCI) is a remote sensing-based index used to assess vegetation thermal stress due to variations in temperature, including excessive heat or wetness. It utilizes thermal bands from satellite data to estimate the stress on vegetation by comparing current land surface temperature conditions against historical temperature data ranges.</p><p>TCI = [LST(max) - LST(i)]/[LST(max) - LST(min)]</p><p><em><strong>Refrences:</strong> Niranga Alahacoon & Mahesh Edirisinghe (2022) A comprehensive assessment of remote sensing and traditional based drought monitoring indices at global and regional scale, Geomatics, Natural Hazards and Risk, 13:1, 762-799, DOI: 10.1080/19475705.2022.2044394</em></p></div>',
      min: 0,
      max: 1,
    },
    {
      title: "VCI",
      value: "VCI",
      disabled: false,
      category: "Agricultural Drought",
      detail:
        '<div className="search-content-img discription-text"><p>VCI stands for Vegetation Condition Index.<br>Pixel-based VCI calculation is more effective to identify the drought condition irrespective of the ecological region. The range of VCI values varies between 0-100 and the value 0 reveals extreme stress while 100 expresses healthy vegetation. NDVImin and NDVImax are the long-term minimum and maximum NDVI for given pixel and the NDVIi is the current NDVI for the same pixel.&nbsp;<br>VCI = NDVIi -NDVIminNDVImax-NDVImin*100</p><p><em><strong>Reference:</strong> Kogan F.N. 1995. Application of vegetation index and brightness temperature for drought detection. Advances in Space Research, 15(11): 91–100. DOI: 10.1016/0273-1177(95)00079-T.</em></p></div>',
      min: 0,
      max: 1,
    },
    {
      title: "NPP Anomaly (WaPOR)",
      value: "NPP_Anamoly_WAPOR",
      disabled: false,
      category: "Impact",
      detail:
        '<div class="search-content-img discription-text"><p>Net primary productivity (NPP) is the rate at which plants and other primary producers store energy as biomass. Drought is a major factor that affects NPP, and the impact depends on the severity and duration of the drought. Here, WaPOR v3 NPP data is used to calculate NPPAs to evaluate the impact of drought on crop health.</p><p>NPPA = [NPP(i) - NPP(mean)]/[NPP(std)]</p><p>NPP is current time net primary production from WaPOR v3 data, NPPmean is the long-term average and NPPstd is the standard deviation for a baseline period of 2018-last available full year.</p><p><em><strong></strong></em></p></div>',
      min: -1,
      max: 1,
    },
    {
      title: "VHI",
      value: "VHI",
      disabled: false,
      category: "Impact",
      detail:
        '<div class="search-content-img discription-text"><p>The Vegetation Health Index (VHI) integrates the Vegetation Condition Index (VCI) and the Temperature Condition Index (TCI) to provide a comprehensive assessment of vegetation health, which is crucial for monitoring drought, assessing agricultural productivity, and managing food security. The VHI is instrumental in identifying areas with potential vegetation stress or favorable growth conditions, thus supporting decision-making in agriculture and environmental management.</p><p><em><strong>References:</strong> Zeng, J., Zhou, T., Qu, Y. et al. An improved global vegetation health index dataset in detecting vegetation drought. Sci Data 10, 338 (2023). https://doi.org/10.1038/s41597-023-02255-3</em></p></div>',
      min: 0,
      max: 1,
    },
    {
      title: "SMA (WaPOR)",
      value: "SMA_WAPOR",
      disabled: false,
      category: "Agricultural Drought",
      detail:
        '<div class="search-content-img discription-text"><p>Soil moisture anomalies (SMAs) are deviations from the normal amount of water in the soil. It is calculated using root zone soil moisture available from WaPOR v3 dataset. They can be used to identify when soil moisture is too low or too high, which can impact crop yields and agricultural production.</p><p>SMA = [Soil_Moisture(i) - Soil_Moisture(mean)]/[Soil_Moisture(std)]</p><p><em><strong></strong>SM is current time root zone soil moisture from WaPOR v3 data, SMmean is the long-term average and SMstd is the standard deviation for a baseline period of 2018-last available full year.</em></p></div>',
      min: -1,
      max: 1,
    },
    {
      title: "SMCI (FLDAS)",
      value: "SMCI_FLDAS",
      disabled: false,
      category: "Agricultural Drought",
      detail: '<div class="search-content-img discription-text"><p>The Soil Moisture Condition Index (SMCI) is a drought index that quantifies soil moisture to monitor agricultural drought conditions. It is derived from soil moisture and precipitation data, offering a direct measure of the soils wetness or dryness. This index is crucial for understanding and managing the impact of drought on agriculture by providing insights into the current state of soil moisture, which is vital for crop growth and productivity. </p><p>SMCI = [Soil_Moisture(i) - Soil_Moisture(min)]/[Soil_Moisture(max) - Soil_Moisture(min)]</p><p><em><strong>Refrences:</strong> Sánchez, N.; González-Zamora, Á.; Piles, M.; Martínez-Fernández, J. A New Soil Moisture Agricultural Drought Index (SMADI) Integrating MODIS and SMOS Products: A Case of Study over the Iberian Peninsula. Remote Sens. 2016, 8, 287. https://doi.org/10.3390/rs8040287</em></p></div>',
      min: -1,
      max: 1,
    },
    {
      title: "SMCI (SMAP)",
      value: "SMCI_SMAP",
      disabled: false,
      category: "Agricultural Drought",
      detail: '<div class="search-content-img discription-text"><p>The Soil Moisture Condition Index (SMCI) is a drought index that quantifies soil moisture to monitor agricultural drought conditions. It is derived from soil moisture and precipitation data, offering a direct measure of the soils wetness or dryness. This index is crucial for understanding and managing the impact of drought on agriculture by providing insights into the current state of soil moisture, which is vital for crop growth and productivity. </p><p>SMCI = [Soil_Moisture(i) - Soil_Moisture(min)]/[Soil_Moisture(max) - Soil_Moisture(min)]</p><p><em><strong>Refrences:</strong> Sánchez, N.; González-Zamora, Á.; Piles, M.; Martínez-Fernández, J. A New Soil Moisture Agricultural Drought Index (SMADI) Integrating MODIS and SMOS Products: A Case of Study over the Iberian Peninsula. Remote Sens. 2016, 8, 287. https://doi.org/10.3390/rs8040287</em></p></div>',
      min: -1,
      max: 1,
    },
    {
      title: "RDI (WaPOR)",
      value: "RDI_WAPOR",
      disabled: false,
      category: "Meteorological Drought",
      detail:
        '<div class="search-content-img discription-text"><p>The RDI proposed is calculated based on the ratio of P to PET, and it is an ordinary and comprehensive index for assessment of meteorological drought. In this study, RDI has been used as a reference drought index because it requires few datasets and has high sensitivity and resilience.</p><p>RDI = P/PET</p><p>RDI(st) = [RDI(i) - RDI(mean)]/[RDI(std)]</p><p>RDI(st) is the current time standardized RDI, RDImean is the long-term average and RDIstd is the standard deviation for a baseline period of 2018-last available full year datasets from WaPOR.</p><p><em><strong>Refrences:</strong>Tsakiris, G., Pangalou, D., Vangelis, H., 2007. Regional drought assessment based on the reconnaissance drought index (RDI). Water Resour. Manag. 21 (5), 821–833.</em></p></div>',
      min: -1,
      max: 1,
    },
    {
      title: "ESI (WaPOR)",
      value: "ESI_WAPOR",
      disabled: false,
      category: "Meteorological Drought",
      detail:
        '<div class="search-content-img discription-text"><p>The ESI captures the water availability and moisture stress of a region. It is computed based on standardized anomalies in the ratio of actual and potential evapotranspiration  and is typically used to assess hydrological and agricultural drought.</p><p>ESI = AET/PET</p><p>ESI(st) = [ESI(i) - ESI(mean)]/[ESI(std)]</p><p><em><strong></strong></em></p></div>',
      min: -1,
      max: 1,
    },
  ];

  const ListItem = ({
    item,
    selected,
    selectedTwo,
    darkmode,
    handleIndice,
    setmodalMessage,
    setmodalopen,
  }) => {
    const isSelected = selected === item.value;
    const isSelectedTwo = selectedTwo === item.value;

    return (
      <List.Item
        style={{
          pointerEvents: item.disabled ? "none" : "",
          opacity: item.disabled ? 0.5 : 1,
          backgroundColor:
            isSelected || isSelectedTwo
              ? darkmode
                ? "#111a2c"
                : "#e6f4ff"
              : "",
          color: isSelected || isSelectedTwo ? "#1668dc" : null,
        }}
      >
        <div style={{ justifyContent: "space-evenly", width: "90%" }}>
          <div id="listItems">
            <div
              className="column first-column"
              onClick={() => handleIndice(item.value)}
            >
              {isSelected || isSelectedTwo ? (
                <FontAwesomeIcon icon={faEye} />
              ) : (
                <FontAwesomeIcon icon={faEyeSlash} />
              )}
            </div>
            <div
              className="column second-column"
              onClick={() => handleIndice(item.value)}
            >
              {item.title}
            </div>
            <div className="column third-column">
              {item.detail && (
                <FontAwesomeIcon
                  onClick={() => {
                    setmodalMessage(
                      <div dangerouslySetInnerHTML={{ __html: item.detail }} />
                    );
                    setmodalopen(true);
                  }}
                  icon={faInfoCircle}
                />
              )}
            </div>
          </div>
        </div>
      </List.Item>
    );
  };

  return (
    <div>
      {parentList.map((category) => (
        <div key={category}>
          <Divider
            style={{
              borderColor: "#2a547c",
            }}
          >
            {category}
          </Divider>
          <List
            itemLayout="horizontal"
            dataSource={data.filter((item) => item.category === category)}
            renderItem={(item) => (
              <ListItem
                item={item}
                selected={selected}
                selectedTwo={selectedTwo}
                darkmode={darkmode}
                handleIndice={handleIndice}
                setmodalMessage={setmodalMessage}
                setmodalopen={setmodalopen}
              />
            )}
          />
        </div>
      ))}
    </div>
  );
};

export default Indices;
