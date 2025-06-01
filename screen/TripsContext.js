import React, { createContext, useState } from 'react';

export const TripsContext = createContext();

export const TripsProvider = ({ children }) => {
  const [trips, setTrips] = useState([{
    id: 1,
    name: 'Львів',
    city: 'Lviv',
    latitude: 49.8397,
    longitude: 24.0297,
    date: '2024-06-10',
    end_date: '2024-06-15',
    budget: 3000
  }]);

  return (
    <TripsContext.Provider value={[trips, setTrips]}>
      {children}
    </TripsContext.Provider>
  );
};
