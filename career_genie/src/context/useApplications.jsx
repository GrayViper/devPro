import { useContext } from 'react';
import { ApplicationsContext } from './ApplicationsContext';

export const useApplications = () => useContext(ApplicationsContext);
