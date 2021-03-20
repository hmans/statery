import { useEffect, useRef, useState } from "react"
import { useStoreFactory } from "./util/useStoreFactory"

/**
 * Provides reactive read access to a Statery store. Returns a proxy object that
 * provides direct access to the store's state and makes sure that the React component
 * it was invoked from automaticaly re-renders when any of the data it uses is updated.
 *
 * @param store The Statery store to access.
 */
export const useStore = useStoreFactory({ useEffect, useRef, useState })
