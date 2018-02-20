/**
 * @fileoverview Rule to require sorting of import declarations
 * @author Christian Schuller
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "enforce sorted import declarations within modules",
            category: "ECMAScript 6",
            recommended: false
        },

        schema: [
            {
                type: "object",
                properties: {
                    ignoreCase: {
                        type: "boolean"
                    },
                    memberSyntaxSortOrder: {
                        type: "array",
                        items: {
                            enum: ["none", "all", "multiple", "single"]
                        },
                        uniqueItems: true,
                        minItems: 4,
                        maxItems: 4
                    },
                    typeSortStrategy: {
                        type: "string",
                        enum: ["mixed", "before", "after"]
                    },
                    ignoreMemberSort: {
                        type: "boolean"
                    }
                },
                additionalProperties: false
            }
        ],

        fixable: "code"
    },

    create(context) {

        const configuration = context.options[0] || {},
            ignoreCase = configuration.ignoreCase || false,
            ignoreMemberSort = configuration.ignoreMemberSort || false,
            memberSyntaxSortOrder = configuration.memberSyntaxSortOrder || ["none", "all", "multiple", "single"],
            typeSortStrategy = configuration.typeSortStrategy || "after",
            sourceCode = context.getSourceCode();
        let previousDeclaration = null,
            initialSource = null,
            allDeclarations = sourceCode.ast.body.filter(n => n.type === 'ImportDeclaration');

        /**
         * Gets the used member syntax style.
         *
         * import "my-module.js" --> none
         * import * as myModule from "my-module.js" --> all
         * import {myMember} from "my-module.js" --> single
         * import {foo, bar} from  "my-module.js" --> multiple
         *
         * @param {ASTNode} node - the ImportDeclaration node.
         * @returns {string} used member parameter style, ["all", "multiple", "single"]
         */
        function usedMemberSyntax(node) {
            if (node.specifiers.length === 0) {
                return "none";
            } else if (node.specifiers[0].type === "ImportNamespaceSpecifier") {
                return "all";
            } else if (node.specifiers[0].type === "ImportDefaultSpecifier") {
                return "single";
            }
            return "multiple";
        }

        /**
         * Gets the group by member parameter index for given declaration.
         * @param {ASTNode} node - the ImportDeclaration node.
         * @returns {number} the declaration group by member index.
         */
        function getMemberParameterGroupIndex(node) {
            return memberSyntaxSortOrder.indexOf(usedMemberSyntax(node));
        }

        /**
         * Gets the local name of the first imported module.
         * @param {ASTNode} node - the ImportDeclaration node.
         * @returns {?string} the local name of the first imported module.
         */
        function getFirstLocalMemberName(node) {
            if (node.specifiers.length) {
                return node.specifiers[0].local.name;
            } else {
                return node.source.value;
            }
            return null;
        }

        /**
         * Gets if there are lines (empty or comments) between two nodes
         * @param {ASTNode} firstNode - the ImportDeclaration node.
         * @param {ASTNode} secondNode - the ImportDeclaration node.
         * @returns {boolean} if there are lines between the nodes.
         */
        function isLineBetween(firstNode, secondNode) {
            return firstNode.loc.end.line < secondNode.loc.start.line - 1;
        }

        function sortAndFixAllNodes(initial, nodes) {
          const rich = nodes.map(node => [node, initial.substring(node.range[0], node.range[1])]);
          const betweens = nodes.map((node, i) => i !== (nodes.length - 1) ? initial.substring(node.range[1], nodes[i + 1].range[0]) : null).filter(n => n !== null);

          const fixed = rich.map(n => {
            const node = n[0];
            if (!ignoreMemberSort) {
                const importSpecifiers = node.specifiers.filter(specifier => specifier.type === "ImportSpecifier");
                const getSortableName = ignoreCase ? specifier => specifier.local.name.toLowerCase() : specifier => specifier.local.name;
                const firstUnsortedIndex = importSpecifiers.map(getSortableName).findIndex((name, index, array) => array[index - 1] > name);
                if (firstUnsortedIndex !== -1) {
                  const before = initial.substring(node.range[0], importSpecifiers[0].range[0]);
                  const after = initial.substring(importSpecifiers[importSpecifiers.length - 1].range[1], node.range[1]);

                  const between = importSpecifiers
                      // Clone the importSpecifiers array to avoid mutating it
                      .slice()
                      // Sort the array into the desired order
                      .sort((specifierA, specifierB) => {
                          const aName = getSortableName(specifierA);
                          const bName = getSortableName(specifierB);

                          return aName > bName ? 1 : -1;
                      })
                      // Build a string out of the sorted list of import specifiers and the text between the originals
                      .reduce((sourceText, specifier, index) => {
                          const textAfterSpecifier = index === importSpecifiers.length - 1
                              ? ''
                              : initial.slice(importSpecifiers[index].range[1], importSpecifiers[index + 1].range[0]);

                          return sourceText + initial.substring.apply(initial, specifier.range) + textAfterSpecifier;
                      }, '');

                  return [node, `${before}${between}${after}`];
                }
            }
            return n;
          });

          // Group by ImportDeclarations that are consecutive (no lines inbetween)
          const sections = fixed.reduce((sections, current) => {
              const lastSection = sections[sections.length - 1];
              if (lastSection.length === 0) {
                  lastSection.push(current);
              } else {
                  const lastFixed = lastSection[lastSection.length - 1];
                  if (isLineBetween(lastFixed[0], current[0])) {
                      sections.push([ current ]);
                  } else {
                      lastSection.push(current);
                  }
              }
              return sections;
          }, [[]])

          // Sort each grouping
          const sorted = sections.map(section => {
              return section.sort((a, b) => {
                const currentMemberSyntaxGroupIndex = getMemberParameterGroupIndex(b[0]),
                    currentMemberIsType = (b[0].importKind && b[0].importKind === 'type') || false,
                    previousMemberSyntaxGroupIndex = getMemberParameterGroupIndex(a[0]),
                    previousMemberIsType = (a[0].importKind && a[0].importKind === 'type') || false;
                let currentLocalMemberName = getFirstLocalMemberName(b[0]),
                    previousLocalMemberName = getFirstLocalMemberName(a[0]);
                if (ignoreCase) {
                    previousLocalMemberName = previousLocalMemberName && previousLocalMemberName.toLowerCase();
                    currentLocalMemberName = currentLocalMemberName && currentLocalMemberName.toLowerCase();
                }
                if (typeSortStrategy !== "mixed" && currentMemberIsType !== previousMemberIsType) {
                  return ((currentMemberIsType && typeSortStrategy === "before") || (previousMemberIsType && typeSortStrategy === "after")) ? 1 : -1;
                } if (currentMemberSyntaxGroupIndex !== previousMemberSyntaxGroupIndex) {
                  return (currentMemberSyntaxGroupIndex < previousMemberSyntaxGroupIndex) ? 1 : -1;
                } else if(previousLocalMemberName && currentLocalMemberName) {
                  return (currentLocalMemberName < previousLocalMemberName) ? 1 : -1;
                }

                return 0;
              });
          }).reduce((a, c) => a.concat(c), []); // Flatten groupings

          return sorted.map(n => n[1]).reduce((done, current, i) => (`${done}${i !== 0 ? betweens[i - 1] : ''}${current}`), '');
        }

        return {
            ImportDeclaration(node) {
                if (!initialSource) {
                  initialSource = sourceCode.getText();
                }

                if (previousDeclaration && !isLineBetween(previousDeclaration, node)) {
                    const currentMemberSyntaxGroupIndex = getMemberParameterGroupIndex(node),
                        currentMemberIsType = (node.importKind && node.importKind === 'type') || false,
                        previousMemberSyntaxGroupIndex = getMemberParameterGroupIndex(previousDeclaration),
                        previousMemberIsType = (previousDeclaration.importKind && previousDeclaration.importKind === 'type') || false;
                    let currentLocalMemberName = getFirstLocalMemberName(node),
                        previousLocalMemberName = getFirstLocalMemberName(previousDeclaration);

                    if (ignoreCase) {
                        previousLocalMemberName = previousLocalMemberName && previousLocalMemberName.toLowerCase();
                        currentLocalMemberName = currentLocalMemberName && currentLocalMemberName.toLowerCase();
                    }

                    // When the current declaration uses a different member syntax,
                    // then check if the ordering is correct.
                    // Otherwise, make a default string compare (like rule sort-vars to be consistent) of the first used local member name.
                    if (typeSortStrategy !== "mixed" && currentMemberIsType !== previousMemberIsType) {
                        if ((currentMemberIsType && typeSortStrategy === "before") || (previousMemberIsType && typeSortStrategy === "after")) {
                            context.report({
                                node: node,
                                message: "Expected type imports '{{typeSortStrategy}}' all other imports.",
                                data: {
                                    typeSortStrategy: typeSortStrategy,
                                },
                                fix(fixer) {
                                  return fixer.replaceTextRange([allDeclarations[0].range[0], allDeclarations[allDeclarations.length - 1].range[1]], sortAndFixAllNodes(initialSource, allDeclarations));
                                }
                            });
                        }
                    } else if (currentMemberSyntaxGroupIndex !== previousMemberSyntaxGroupIndex) {
                        if (currentMemberSyntaxGroupIndex < previousMemberSyntaxGroupIndex) {
                            context.report({
                                node: node,
                                message: "Expected '{{syntaxA}}' syntax before '{{syntaxB}}' syntax.",
                                data: {
                                    syntaxA: memberSyntaxSortOrder[currentMemberSyntaxGroupIndex],
                                    syntaxB: memberSyntaxSortOrder[previousMemberSyntaxGroupIndex]
                                },
                                fix(fixer) {
                                  return fixer.replaceTextRange([allDeclarations[0].range[0], allDeclarations[allDeclarations.length - 1].range[1]], sortAndFixAllNodes(initialSource, allDeclarations));
                                }
                            });
                        }
                    } else {
                        if (previousLocalMemberName &&
                            currentLocalMemberName &&
                            currentLocalMemberName < previousLocalMemberName
                        ) {
                            context.report({
                                node,
                                message: "Imports should be sorted alphabetically.",
                                fix(fixer) {
                                  return fixer.replaceTextRange([allDeclarations[0].range[0], allDeclarations[allDeclarations.length - 1].range[1]], sortAndFixAllNodes(initialSource, allDeclarations));
                                }
                            });
                        }
                    }
                }

                // Multiple members of an import declaration should also be sorted alphabetically.

                if (!ignoreMemberSort) {
                    const importSpecifiers = node.specifiers.filter(specifier => specifier.type === "ImportSpecifier");
                    const getSortableName = ignoreCase ? specifier => specifier.local.name.toLowerCase() : specifier => specifier.local.name;
                    const firstUnsortedIndex = importSpecifiers.map(getSortableName).findIndex((name, index, array) => array[index - 1] > name);

                    if (firstUnsortedIndex !== -1) {
                        context.report({
                            node: importSpecifiers[firstUnsortedIndex],
                            message: "Member '{{memberName}}' of the import declaration should be sorted alphabetically.",
                            data: { memberName: importSpecifiers[firstUnsortedIndex].local.name },
                            fix(fixer) {
                                if (importSpecifiers.some(specifier => sourceCode.getComments(specifier).leading.length || sourceCode.getComments(specifier).trailing.length)) {

                                    // If there are comments in the ImportSpecifier list, don't rearrange the specifiers.
                                    return null;
                                }
                                return fixer.replaceTextRange([allDeclarations[0].range[0], allDeclarations[allDeclarations.length - 1].range[1]], sortAndFixAllNodes(initialSource, allDeclarations));
                            }
                        });
                    }
                }

                previousDeclaration = node;
            }
        };
    }
};
