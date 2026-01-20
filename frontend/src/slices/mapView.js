import { createSlice } from "@reduxjs/toolkit";

const mapView = createSlice({
  name: "mapView",
  initialState: {
    center: [33.6844, 73.0479],
    zoom: 4,
    loggedin: false,
    selected: "",
    selectedTwo: "",
    selectedWapor: "",
    module: "monitoring",
    darkmode: false,
    admin: 0,
    showTour: true,
    selectedKey: "home",
    admin1: false,
    admin1Name: "",
    admin2: false,
    fileName: "",
  },
  reducers: {
    setCenter: (state, action) => {
      state.center = action.payload;
    },
    setZoom: (state, action) => {
      state.zoom = action.payload;
    },
    setLoggedIn: (state, action) => {
      state.loggedin = action.payload;
    },
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
    setSelectedTwo: (state, action) => {
      state.selectedTwo = action.payload;
    },
    setSelectedWapor: (state, action) => {
      state.selectedWapor = action.payload;
    },
    setmodule: (state, action) => {
      state.module = action.payload;
    },
    setdarkmode: (state, action) => {
      state.darkmode = action.payload;
    },
    clearResults: (state, action) => {
      state = {
        center: [33.6844, 73.0479],
        zoom: 4,
        loggedin: false,
        admin: 0,
      };
    },
    setadmin: (state, action) => {
      state.admin = action.payload;
    },
    setshowTour: (state, action) => {
      state.showTour = action.payload;
    },
    setselectedKey: (state, action) => {
      state.selectedKey = action.payload;
    },
    setadmin1: (state, action) => {
      state.admin1 = action.payload;
    },
    setadmin1Name: (state, action) => {
      state.admin1Name = action.payload;
    },
    setadmin2: (state, action) => {
      state.admin2 = action.payload;
    },
    setadmin2Name: (state, action) => {
      state.admin2Name = action.payload;
    },
    setFileName: (state, action) => {
      state.fileName = action.payload;
    },
  },
});

export const {
  setCenter,
  setZoom,
  setLoggedIn,
  setSelectedWapor,
  setSelected,
  setSelectedTwo,
  setmodule,
  setdarkmode,
  clearResults,
  setadmin,
  setshowTour,
  setselectedKey,
  setadmin1,
  setadmin1Name,
  setadmin2,
  setadmin2Name,
  setFileName,
} = mapView.actions;

export default mapView.reducer;
