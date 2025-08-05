/**
 * HTML 元素延迟验证工具
 * 参考原有的 sub-chart-indicator-pane.tsx 中的逻辑
 */

export interface ElementValidationOptions {
    maxRetries?: number;
    initialDelay?: number;
    retryDelay?: number;
    minWidth?: number;
    minHeight?: number;
    enableViewportCheck?: boolean;
}

export interface ElementValidationResult {
    isValid: boolean;
    element: HTMLElement | null;
    rect: DOMRect | null;
    retryCount: number;
}

/**
 * 验证 HTML 元素是否有效（有尺寸且在视口内）
 */
export function validateHTMLElement(
    element: HTMLElement | null,
    options: ElementValidationOptions = {}
): ElementValidationResult {
    const {
        minWidth = 0,
        minHeight = 0,
        enableViewportCheck = true
    } = options;

    if (!element) {
        return {
            isValid: false,
            element: null,
            rect: null,
            retryCount: 0
        };
    }

    const rect = element.getBoundingClientRect();

    // 检查尺寸
    const hasValidSize = rect.width > minWidth && rect.height > minHeight;
    
    // 检查是否在视口内
    let isInViewport = true;
    if (enableViewportCheck) {
        isInViewport = rect.top > -window.innerHeight &&
                      rect.left > -window.innerWidth &&
                      rect.top < window.innerHeight * 2 &&
                      rect.left < window.innerWidth * 2;
    }

    const isValid = hasValidSize && isInViewport;

    return {
        isValid,
        element,
        rect,
        retryCount: 0
    };
}

/**
 * 带重试机制的 HTML 元素验证
 */
export function validateHTMLElementWithRetry(
    getElement: () => HTMLElement | null,
    onSuccess: (result: ElementValidationResult) => void,
    onFailure?: (result: ElementValidationResult) => void,
    options: ElementValidationOptions = {}
): () => void {
    const {
        maxRetries = 5,
        initialDelay = 150,
        retryDelay = 100
    } = options;

    let retryCount = 0;
    let retryTimer: NodeJS.Timeout | null = null;
    let isMounted = true;

    const validateElement = () => {
        if (!isMounted) return;

        try {
            const element = getElement();
            const result = validateHTMLElement(element, options);
            result.retryCount = retryCount;

            if (result.isValid) {
                onSuccess(result);
                return;
            }

            // 如果验证失败且还有重试次数
            retryCount++;
            if (retryCount < maxRetries) {
                const delay = retryCount === 1 ? initialDelay : retryDelay;
                retryTimer = setTimeout(() => {
                    if (isMounted) {
                        validateElement();
                    }
                }, delay);
            } else {
                // 达到最大重试次数
                if (onFailure) {
                    onFailure(result);
                }
            }
        } catch (error) {
            console.error("HTML元素验证过程中发生错误:", error);
            
            // 即使出错也要重试
            retryCount++;
            if (retryCount < maxRetries) {
                retryTimer = setTimeout(() => {
                    if (isMounted) {
                        validateElement();
                    }
                }, retryDelay);
            } else if (onFailure) {
                onFailure({
                    isValid: false,
                    element: null,
                    rect: null,
                    retryCount
                });
            }
        }
    };

    // 开始验证
    validateElement();

    // 返回清理函数
    return () => {
        isMounted = false;
        if (retryTimer) {
            clearTimeout(retryTimer);
            retryTimer = null;
        }
    };
}

/**
 * 验证 Pane API 的 HTML 元素
 */
export function validatePaneHTMLElement(
    paneApi: any, // IPaneApi 类型
    indicatorKeyStr: string,
    options: ElementValidationOptions = {}
): Promise<ElementValidationResult> {
    return new Promise((resolve, reject) => {
        const cleanup = validateHTMLElementWithRetry(
            () => {
                if (paneApi && typeof paneApi.getHTMLElement === 'function') {
                    return paneApi.getHTMLElement();
                }
                return null;
            },
            (result) => {
                console.log(`✅ Pane HTML元素验证成功:`, {
                    width: result.rect?.width,
                    height: result.rect?.height,
                    retryCount: result.retryCount
                });
                cleanup();
                resolve(result);
            },
            (result) => {
                console.error(`❌ Pane  HTML元素验证失败，达到最大重试次数:`, {
                    maxRetries: options.maxRetries || 5,
                    retryCount: result.retryCount
                });
                cleanup();
                reject(new Error(`Pane  HTML元素验证失败`));
            },
            {
                maxRetries: 5,
                initialDelay: 150,
                retryDelay: 100,
                minWidth: 0,
                minHeight: 0,
                enableViewportCheck: true,
                ...options
            }
        );
    });
}

/**
 * 验证图表容器元素
 */
export function validateChartContainer(
    containerRef: React.RefObject<HTMLElement | null>,
    options: ElementValidationOptions = {}
): Promise<ElementValidationResult> {
    return new Promise((resolve, reject) => {
        const cleanup = validateHTMLElementWithRetry(
            () => containerRef.current,
            (result) => {
                console.log(`✅ 图表容器验证成功:`, {
                    width: result.rect?.width,
                    height: result.rect?.height,
                    retryCount: result.retryCount
                });
                cleanup();
                resolve(result);
            },
            (result) => {
                console.error(`❌ 图表容器验证失败:`, {
                    retryCount: result.retryCount
                });
                cleanup();
                reject(new Error("图表容器验证失败"));
            },
            {
                maxRetries: 3,
                initialDelay: 100,
                retryDelay: 50,
                minWidth: 100,
                minHeight: 100,
                enableViewportCheck: false,
                ...options
            }
        );
    });
}
