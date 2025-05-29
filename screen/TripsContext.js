import React, { createContext, useState } from 'react';

export const TripsContext = createContext();

export const TripsProvider = ({ children }) => {
  const [trips, setTrips] = useState([]);

  return (
    <TripsContext.Provider value={[trips, setTrips]}>
      {children}
    </TripsContext.Provider>
  );
};
