import { isRedirectError } from "next/dist/client/components/redirect-error";

type ActionFn<T> = () => Promise<T>;

// Overload for calling with options
export async function executeAction<T>(
    options: { actionFn: ActionFn<T>; successMessage?: string }
): Promise<{ success: boolean; message: string; data?: T }>;
export async function executeAction<T>(
    actionFn: ActionFn<T>
): Promise<{ success: boolean; error?: string; data?: T }>;

// Implementation
export async function executeAction<T>(
    actionFnOrOptions: ActionFn<T> | { actionFn: ActionFn<T>; successMessage?: string }
): Promise<{ success: boolean; message?: string; error?: string; data?: T }> {
    try {
        const actionFn = typeof actionFnOrOptions === 'function'
            ? actionFnOrOptions
            : actionFnOrOptions.actionFn;

        const result = await actionFn();

        if (typeof actionFnOrOptions === 'function') {
            // If called directly, return result in the appropriate format
            return {
                success: true,
                data: result
            };
        } else {
            // If called with options, use the old format
            return {
                success: true,
                message: actionFnOrOptions.successMessage ?? "The action was successful",
                data: result
            };
        }
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }

        if (typeof actionFnOrOptions === 'function') {
            // Format for direct call
            return {
                success: false,
                error: error instanceof Error ? error.message : "An error occurred"
            };
        } else {
            // Format for call with options
            return {
                success: false,
                message: "An error has occurred during executing the action",
            };
        }
    }
}