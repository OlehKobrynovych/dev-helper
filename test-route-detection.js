
function analyzeAPIRoutes(jsFiles) {
  const routes = [];

  jsFiles.forEach(function (file) {
    const content = file.content;

    // 6. axiosInterceptor.get або інші кастомні інстанси
    // Оновлений regex: підтримує api.get, http.post, request.put, client.delete
    // та суфікси Service, Interceptor, Client, Api, Instance, Axios
    const customAxiosMatches = content.matchAll(
      /\b((?:[a-zA-Z_$][a-zA-Z0-9_$]*)(?:Interceptor|Client|Api|Instance|Axios|Service)|api|http|request|client)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi
    );
    for (const match of customAxiosMatches) {
      const method = match[2].toUpperCase();
      const path = match[3];
      routes.push({
        method: method,
        path: path,
        type: "client",
        match: match[0]
      });
    }

    // 7. useSWR hooks: useSWR('/api/user', fetcher)
    const swrMatches = content.matchAll(
      /\buseSWR\s*\(\s*['"`]([^'"`]+)['"`]/gi
    );
    for (const match of swrMatches) {
      const path = match[1];
      routes.push({
        method: "GET",
        path: path,
        type: "client",
        match: match[0]
      });
    }
  });

  return routes;
}

const testFiles = [
  {
    name: "test.js",
    content: `
      // Should match
      api.get('/users');
      http.post('/login');
      request.put('/update');
      client.delete('/item');
      myService.patch('/patch');
      userApi.get('/user');
      authClient.post('/auth');
      
      // useSWR
      const { data } = useSWR('/api/data', fetcher);
      
      // Should NOT match (too short variable without known name)
      a.get('/fail');
      
      // Should NOT match (wrong suffix)
      myHelper.get('/fail');
    `
  }
];

const result = analyzeAPIRoutes(testFiles);
console.log(JSON.stringify(result, null, 2));
