import { useContext } from 'react';
import { JobsContext } from './JobsContext';

export const useJobs = () => useContext(JobsContext);
