"use client";

import { useEffect, useState } from "react";
import { listPatients, PacientesApiError, type Patient } from "@/features/pacientes";
import { useDebounce } from "./use-debounce";

export function usePatientSearch(initialSearch = "") {
  const [search, setSearch] = useState(initialSearch);
  const [results, setResults] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    let isCurrent = true;
    async function searchPatients() {
      if (debouncedSearch.trim().length < 2) {
        setResults([]);
        setError("");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError("");
      try {
        const result = await listPatients({ search: debouncedSearch, page: 1, pageSize: 6 });
        if (isCurrent) setResults(result.items);
      } catch (reason) {
        if (isCurrent) setError(reason instanceof PacientesApiError ? reason.message : "No se pudo buscar pacientes.");
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    void searchPatients();
    return () => { isCurrent = false; };
  }, [debouncedSearch]);

  return { search, setSearch, results, isLoading, error };
}
