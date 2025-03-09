function main({resp}) {
    try {
        const response = JSON.parse(resp);
        if (response.data) {
            const data = response.data;
            if (data.webPages) {
                const webPages = data.webPages;
                if (webPages.value) {
                    const contexts = webPages.value;
                    const maxContext = Math.min(contexts.length, 10);
                    let formattedContexts = [];
                    for (let i = 0; i < maxContext; i++) {
                        const context = contexts[i];
                        const formattedContext = `[[引用:${i + 1}]]\n网页标题:${context.name}\n网页链接:${context.url}\n网页内容:${context.summary}\n发布时间:${context.dateLastCrawled}\n网站名称:${context.name}`;
                        formattedContexts.push(formattedContext);
                    }
                    const context = formattedContexts.join("\n\n");
                    return {
                        context: context
                    };
                }
            }
        }
        return {
            context: "暂无搜索结果"
        };
    } catch (error) {
        return {
            context: "error searching"
        };
    }
}
