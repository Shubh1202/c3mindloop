export type LanguageId = 'javascript' | 'python' | 'go' | 'rust' | 'php' | 'java' | 'csharp';

export interface LanguageSnippet {
  id: LanguageId;
  name: string;
  code: string;
}

export function generatePolyglotSnippets(
  pattern: string,
  flags: { global?: boolean; ignoreCase?: boolean; multiline?: boolean; dotAll?: boolean } = {}
): LanguageSnippet[] {
  const p = pattern || '.*';
  const flagStr = [
    flags.global ? 'g' : '',
    flags.ignoreCase ? 'i' : '',
    flags.multiline ? 'm' : '',
    flags.dotAll ? 's' : '',
  ].join('');

  // JS/TS
  const jsCode = `// TypeScript / JavaScript
const regex = /${p}/${flagStr};

const testString = "sample_input";
const isMatch = regex.test(testString);
const matches = testString.match(regex);
console.log({ isMatch, matches });`;

  // Python
  const pyFlags = [
    flags.ignoreCase ? 're.IGNORECASE' : '',
    flags.multiline ? 're.MULTILINE' : '',
    flags.dotAll ? 're.DOTALL' : '',
  ].filter(Boolean).join(' | ');

  const pyCode = `# Python
import re

pattern = re.compile(r"${p}"${pyFlags ? `, ${pyFlags}` : ''})
test_string = "sample_input"

match = pattern.search(test_string)
if match:
    print(f"Matched: {match.group(0)}")
else:
    print("No match found")`;

  // Go
  const goCode = `// Go
package main

import (
\t"fmt"
\t"regexp"
)

func main() {
\trx := regexp.MustCompile(\`${p}\`)
\ttestStr := "sample_input"

\tif rx.MatchString(testStr) {
\t\tfmt.Printf("Matched: %s\\n", rx.FindString(testStr))
\t}
}`;

  // Rust
  const rustCode = `// Rust (Cargo.toml: regex = "1")
use regex::Regex;

fn main() {
    let re = Regex::new(r"${p}").unwrap();
    let text = "sample_input";

    if let Some(caps) = re.captures(text) {
        println!("Matched: {}", &caps[0]);
    }
}`;

  // PHP
  const phpCode = `<?php
// PHP
$pattern = '/${p}/${flagStr}';
$testString = 'sample_input';

if (preg_match($pattern, $testString, $matches)) {
    echo "Matched: " . $matches[0];
} else {
    echo "No match";
}`;

  // Java
  const javaCode = `// Java
import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class RegexDemo {
    public static void main(String[] args) {
        Pattern pattern = Pattern.compile("${p.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}");
        Matcher matcher = pattern.matcher("sample_input");

        if (matcher.find()) {
            System.out.println("Matched: " + matcher.group(0));
        }
    }
}`;

  // C#
  const csharpCode = `// C#
using System;
using System.Text.RegularExpressions;

class Program {
    static void Main() {
        Regex regex = new Regex(@"${p.replace(/"/g, '""')}");
        string input = "sample_input";

        Match match = regex.Match(input);
        if (match.Success) {
            Console.WriteLine($"Matched: {match.Value}");
        }
    }
}`;

  return [
    { id: 'javascript', name: 'JavaScript / TS', code: jsCode },
    { id: 'python', name: 'Python (re)', code: pyCode },
    { id: 'go', name: 'Go (regexp)', code: goCode },
    { id: 'rust', name: 'Rust (regex)', code: rustCode },
    { id: 'php', name: 'PHP (preg_match)', code: phpCode },
    { id: 'java', name: 'Java (Pattern)', code: javaCode },
    { id: 'csharp', name: 'C# (Regex)', code: csharpCode },
  ];
}
