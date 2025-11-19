
function analyzeAPIRoutes(jsFiles) {
  const routes = [];

  jsFiles.forEach(function (file) {
    const content = file.content;

    // 8. Custom Request Wrappers: fetchRequest("GET", "/api/url")
    const customWrapperMatches = content.matchAll(
      /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(\s*["'](GET|POST|PUT|DELETE|PATCH)["']\s*,\s*[`'"]([^`'"]+)[`'"]/gi
    );
    for (const match of customWrapperMatches) {
      const method = match[2].toUpperCase();
      const path = match[3];
      
      if (path.length > 1) {
        routes.push({
          method: method,
          path: path,
          type: "client",
          match: match[0]
        });
      }
    }
  });

  return routes;
}

const testFiles = [
  {
    name: "test-custom.js",
    content: `
      // Should match
      fetchRequest("GET", "/manage/softwares/\${projectId}");
      myApiCall('POST', '/api/login');
      execute("DELETE", \`/api/items/\${id}\`);
      
      // Should NOT match
      someFunc("HELLO", "/api/test"); // Wrong method
      otherFunc("GET", varName); // Variable instead of string literal (current limitation, acceptable)
    `
  }
];

const result = analyzeAPIRoutes(testFiles);
console.log(JSON.stringify(result, null, 2));
