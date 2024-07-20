import { Dispatch, SetStateAction, useState } from "react";


export function useApi<T>(initial_loading: boolean = false): [(callback: () => Promise<T>) => Promise<T | undefined>, boolean, string, Dispatch<SetStateAction<string>>] {
    // const [val, setVal] = useState<T>(initial);
    const [loading, setLoading] = useState(initial_loading);
    const [error, setError] = useState("");



    const callApi = async (callback: () => Promise<T>) => {
        setLoading(true);
        setError("");
        try {
            const result: T = await callback();
            return result;
        }
        catch (err) {
            const error = err as Error;
            console.error(error);
            setError("Failed to call API")
        }
        finally {
            setLoading(false);
        }
    }

    return [callApi, loading, error, setError];
}