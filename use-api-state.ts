import { Dispatch, SetStateAction, useState } from "react";

export function useApiState<T, V = void>(initial: T, initial_loading: boolean = false): [T, Dispatch<SetStateAction<T>>, (callback: () => Promise<V>) => Promise<V | undefined>, boolean, string, Dispatch<SetStateAction<string>>] {
    const [val, setVal] = useState<T>(initial);
    const [loading, setLoading] = useState(initial_loading);
    const [error, setError] = useState("");

    const callApi = async (callback: () => Promise<V>) => {
        setLoading(true);
        setError("");
        try {
            const result: V = await callback();
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

    return [val, setVal, callApi, loading, error, setError];
}

