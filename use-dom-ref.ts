import React, { ReactNode, useEffect, useRef } from "react";

export default function useDomRef<T=HTMLElement|ReactNode>(callback:() => HTMLElement|ReactNode){
    const ref = useRef<T|null>(null);

    useEffect(() => {
        ref.current = callback() as T;
    },[])

    return ref.current;
}