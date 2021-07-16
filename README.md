# SeqEditor
Fully functional biological Sequence Editor

You can try the software out at the following github pages link:

https://muuuchem.github.io/SeqEditor/

Designed as a complete remake of an unused prototype I created two years ago.

Sequences can be imported by pasting in the fasta but also by an xml format which can be
generated from any sequence you have drawn.

Because fasta usually does not contain information about linkages within or between chains,
testing this application with the xml samples will show off the most impressive capabilities.
Once you have clicked the last button on the toolbar and inserted the xml below, try adding
text and see how the editor dynamically rerenders the bonds such that the linkages move with
the part of the sequence it is bonded to. Once you are done making changes, press the next
to the last button to generate the unique XML that you can use to rerender the same exact 
visualization.

Chains can be edited by double clicking on text(blank chains start with "AAA" by default).

Chains can be deleted by clicking on chain once to highlight them, then clicking the button
that says "delete chain" once you hover over it.

When editing text, you will see any bonds move along with the text, and as soon as you click
away from the textbox, the text will realign with the numbering system. If bonds are glitchy and
not connected (may happen when editing/deleting bonds and annotations, although I think I have mostly
fixed this issue), simply press the refresh button or add and delete a character and the bonds should
instantly rerender.

**Click the last button on the toolbar and paste in some of the examples below:**

Complex bonding pattern:

```xml
<se><chain><c>Seq1 [organism=Test Organism]</c><seq s='UAGUUGGAACAGCCCUCAGCCUACUCAUCCGAGCAGAACUAGGCCAACCCGGAACCCUCCUGGGAGAUGACCAAAUCUACAAUGUAAUCGUCACUGCCCAUGCCUUCGUAAUAAUCUUCUUCAUAGUAAUACCAGUCAUAAUUGGAGGCUUCGGAAACUGACUAGUCCCCCUCAUAAUCGGCGCUCCAGACAUAGCAUUCCCACGUAUAAACAACAUAAGCUUCUGACUCCUACCCCCAUCCUUCCUACUCCUCCUAGCCUCAUCCACAGUGGAAGCAGGCGCAGGAACAGGAUGAACGGUGUACCCCCCACUAGCUGGCAACCUAGCCCAUGCCGGAGCCUCAGUAGAUCCAUCAACAUAAAACCACCAGCCCUAUCACAAUAUCAAACUCCAUUAUUC' ><a st='3' ed='240' c='#ccff99' t='b'>This is an annotation within the sequence!</a><a st='246' ed='400' c='#00ff66' t='b'>This is an annotated area of the sequence!</a></seq><b st='1' end='55' t='disulfidebond'></b><b st='23' end='34' t='hydrogen'></b></chain><chain><c>Seq2 [organism=Test Organism]</c><seq s='UAGUUGGAACAGCCCUCAGCCUACUCAUCCGAGCAGAACUAGGCCAACCCGGAACCCUCCUGGGAGAUGAAUUGGAGGCUUCGGAAACUGACUAGUCCCCCUCAUAAUCGGCGCUCCAGACAUAGCAUUCCCACGUAUAAACAACAUAAGCUUCUGACUCCUACCCCCAUCCUUCCUACUCCUCCUAGCCUCAUCCACAGUGGAAGCAGGCGCAGGAACAGGAUGAACGGUGUACCCCCCACUAGCUGGCAACCUAGCCCAUGCCGGAGCCUCAGUAGAUCUAGCUAUUUUCUCACUCCACUUAGCAGGGGUAUCCUCUAUUCUAGGUGCAAUCAAUUUCAUCACAACCGCCAUCAACAUAAAACCACCAGCCCUAUCACAAUAUCAAACUCCAUUAUUCGUGUGAUCCGUACUCAUCACUGCCGUCCUACUACUAUUAUCCCUCCCAGUCCUAGCCGCCGGCAUCACUAUGCUCCUCACAGACCGAAAUCUGAACACUACAUUCUUCGACCCCGCUGGAGGAGGAGACCCAGUCCUAUACCAACACUUAUUCUGGUUUUUCGGCCACCCAGAAGUUUACAUCCUAAUUCUC' ></seq><b st='66' end='95' t='nitroxy'></b><b st='99' end='188' t='disulfidebond'></b></chain><chain><c>Seq3 [organism=Test Organism]</c><seq s='UAGUUGGAACAGCCCUCAGCCUACUCAUCCGAGCAGAACUAGGCCAACCCGGAACCCUCCUGGGAGAUGACCAAAUCUACAUGUAAUCGUCACUGCCCAUGCCUUCGUAAUAAUCUUCUUCAUAGUAAUACCAGUCAUAAUUGGAGGCUUCGGAAACUGACUAGUCCCCCUCAUAAUCGGCGCUCCAGACAUAGCAUUCCCACGUAUAAACAACAUAAGCUUCUGACUCCUACCCCCAUCCUUCCUACUCCUCCUAGCCUCAUCCACAGUGGAAGCAGGCGCAGGAACAGGAUGAACGGUGUACCCCCCACUAGCUGGCAACCUAGCCCAUGCCGGAGCCUCAGUAGAUCUAGCUAUUUUCUCACUCCACUUAGCAGGGGUAUCCUCUAUUCUAGGUGCAAUCAAUUUCAUCACAACCGCCAUCAACAUAAAACCACCAGCCCUAUCACAAUAUCAAACUCCAUUAUUCGUGUGAUCCGUACUCAUCAC' ></seq><b st='204' end='1' t='nitroxy'></b></chain><cb pos1='14' seq1='0' seq2='1' pos2='88' t='salt bridge' id='6'></cb><cb pos1='100' seq1='0' seq2='1' pos2='90' t='nitroxy' id='7'></cb><cb pos1='12' seq1='1' seq2='2' pos2='88' t='salt bridge' id='8'></cb><cb pos1='17' seq1='0' seq2='2' pos2='144' t='hydrogen' id='9'></cb><cb pos1='30' seq1='0' seq2='2' pos2='20' t='disulfidebond' id='10'></cb><cb pos1='120' seq1='0' seq2='1' pos2='40' t='hydrogen' id='11'></cb><cb pos1='220' seq1='0' seq2='2' pos2='50' t='nitroxy' id='12'></cb><cb pos1='60' seq1='1' seq2='2' pos2='100' t='salt bridge' id='13'></cb><cb pos1='44' seq1='0' seq2='2' pos2='22' t='hydrogen' id='14'></cb><cb pos1='99' seq1='0' seq2='1' pos2='101' t='hydrogen' id='15'></cb><cb pos1='31' seq1='0' seq2='2' pos2='13' t='disulfidebond' id='16'></cb><cb pos1='1' seq1='1' seq2='2' pos2='201' t='nitroxy' id='17'></cb></se>
```
Example of how this tool would represent a hairpin (Notice how spacing between rows is dynamic
based upon bonds):

```xml
<se><chain><c>Hairpin Example on second row</c><seq s='UAACGGGAGUAGUUAUACAUUUCAGAGUUUAUCAAUUCUGUCCUCUUAGGUUUCCUGUUUUUUUUUUUUUUAUAUAUAUAUACAUUAUUGUAAAAUAAUUAUAAUUAUAGGUGAUAAAAAAUUUCAGUAGUUUUAUUUGUUUUAGAUAGUGAAACUAAAAAAUAUUAAAUUAGCUCAUUACUUACAUACUAGAA' ></seq><b st='74' end='108' t='salt bridge'></b><b st='75' end='107' t='hydrogen'></b><b st='76' end='106' t='hydrogen'></b><b st='79' end='103' t='hydrogen'></b><b st='80' end='102' t='hydrogen'></b><b st='81' end='101' t='hydrogen'></b><b st='82' end='100' t='hydrogen'></b><b st='84' end='99' t='hydrogen'></b><b st='85' end='98' t='hydrogen'></b><b st='86' end='97' t='hydrogen'></b><b st='87' end='96' t='hydrogen'></b><b st='88' end='95' t='hydrogen'></b><b st='89' end='94' t='nitroxy'></b></chain></se>
```
Another more Complicated Hairpin:

```xml
<se><chain><c>Complicated Hairpin Example</c><seq s='UAACGGGAGUAGUUAUACAUUUCAGAGUUUAUCAAUUCUGUCCUCUUAGGUUUCCUGUUUUUUUUUUUUUUAUAUAUAUAUACAUUAUUGUAAAAUAAUUAUAAUUAUAGGUGAUAAAAAAUUUCAGUAGUUUUAUUUGUUUUAGAUAGUGAAACUAAAAAAUAUUAAAUUAGCUCAUUACUUACAUACUAGAA' ></seq><b st='14' end='48' t='salt bridge'></b><b st='15' end='47' t='hydrogen'></b><b st='16' end='46' t='hydrogen'></b><b st='19' end='43' t='hydrogen'></b><b st='20' end='42' t='hydrogen'></b><b st='21' end='41' t='hydrogen'></b><b st='22' end='40' t='hydrogen'></b><b st='24' end='39' t='hydrogen'></b><b st='25' end='38' t='hydrogen'></b><b st='26' end='37' t='hydrogen'></b><b st='27' end='36' t='hydrogen'></b><b st='28' end='35' t='hydrogen'></b><b st='29' end='34' t='nitroxy'></b><b st='5' end='52' t='salt bridge'></b><b st='3' end='50' t='nitroxy'></b><b st='2' end='44' t='nitroxy'></b></chain></se>
```
The editor also works with Fasta Sequences! Try importing the following Fasta sequence by clicking the second button from the left
and pasting it into the resulting textbox. The editor can stack chains with different 
names and sequences. The Fasta import feature adds to current chains if they exist, so 
be sure to hit the clear button (1st button) in order to import a completely new
sequence from FASTA.

Single Chain Polypeptide/Protein Sequence:

>tr|A6XGL2|A6XGL2_HUMAN Insulin OS=Homo sapiens OX=9606 GN=INS PE=1 SV=1
MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAED
LQGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN

Multi Chain DNA Sequence:

>HSBGPG Human gene for bone gla protein (BGP)
GGCAGATTCCCCCTAGACCCGCCCGCACCATGGTCAGGCATGCCCCTCCTCATCGCTGGGCACAGCCCAGAGGGT
ATAAACAGTGCTGGAGGCTGGCGGGGCAGGCCAGCTGAGTCCTGAGCAGCAGCCCAGCGCAGCCACCGAGACACC
ATGAGAGCCCTCACACTCCTCGCCCTATTGGCCCTGGCCGCACTTTGCATCGCTGGCCAGGCAGGTGAGTGCCCC
CACCTCCCCTCAGGCCGCATTGCAGTGGGGGCTGAGAGGAGGAAGCACCATGGCCCACCTCTTCTCACCCCTTTG
GCTGGCAGTCCCTTTGCAGTCTAACCACCTTGTTGCAGGCTCAATCCATTTGCCCCAGCTCTGCCCTTGCAGAGG
GAGAGGAGGGAAGAGCAAGCTGCCCGAGACGCAGGGGAAGGAGGATGAGGGCCCTGGGGATGAGCTGGGGTGAAC
CAGGCTCCCTTTCCTTTGCAGGTGCGAAGCCCAGCGGTGCAGAGTCCAGCAAAGGTGCAGGTATGAGGATGGACC
TGATGGGTTCCTGGACCCTCCCCTCTCACCCTGGTCCCTCAGTCTCATTCCCCCACTCCTGCCACCTCCTGTCTG
GCCATCAGGAAGGCCAGCCTGCTCCCCACCTGATCCTCCCAAACCCAGAGCCACCTGATGCCTGCCCCTCTGCTC
CACAGCCTTTGTGTCCAAGCAGGAGGGCAGCGAGGTAGTGAAGAGACCCAGGCGCTACCTGTATCAATGGCTGGG
GTGAGAGAAAAGGCAGAGCTGGGCCAAGGCCCTGCCTCTCCGGGATGGTCTGTGGGGGAGCTGCAGCAGGGAGTG
GCCTCTCTGGGTTGTGGTGGGGGTACAGGCAGCCTGCCCTGGTGGGCACCCTGGAGCCCCATGTGTAGGGAGAGG
AGGGATGGGCATTTTGCACGGGGGCTGATGCCACCACGTCGGGTGTCTCAGAGCCCCAGTCCCCTACCCGGATCC
CCTGGAGCCCAGGAGGGAGGTGTGTGAGCTCAATCCGGACTGTGACGAGTTGGCTGACCACATCGGCTTTCAGGA
GGCCTATCGGCGCTTCTACGGCCCGGTCTAGGGTGTCGCTCTGCTGGCCTGGCCGGCAACCCCAGTTCTGCTCCT
CTCCAGGCACCCTTCTTTCCTCTTCCCCTTGCCCTTGCCCTGACCTCCCAGCCCTATGGATGTGGGGTCCCCATC
ATCCCAGCTGCTCCCAAATAAACTCCAGAAG
>HSGLTH1 Human theta 1-globin gene
CCACTGCACTCACCGCACCCGGCCAATTTTTGTGTTTTTAGTAGAGACTAAATACCATATAGTGAACACCTAAGA
CGGGGGGCCTTGGATCCAGGGCGATTCAGAGGGCCCCGGTCGGAGCTGTCGGAGATTGAGCGCGCGCGGTCCCGG
GATCTCCGACGAGGCCCTGGACCCCCGGGCGGCGAAGCTGCGGCGCGGCGCCCCCTGGAGGCCGCGGGACCCCTG
GCCGGTCCGCGCAGGCGCAGCGGGGTCGCAGGGCGCGGCGGGTTCCAGCGCGGGGATGGCGCTGTCCGCGGAGGA
CCGGGCGCTGGTGCGCGCCCTGTGGAAGAAGCTGGGCAGCAACGTCGGCGTCTACACGACAGAGGCCCTGGAAAG
GTGCGGCAGGCTGGGCGCCCCCGCCCCCAGGGGCCCTCCCTCCCCAAGCCCCCCGGACGCGCCTCACCCACGTTC
CTCTCGCAGGACCTTCCTGGCTTTCCCCGCCACGAAGACCTACTTCTCCCACCTGGACCTGAGCCCCGGCTCCTC
ACAAGTCAGAGCCCACGGCCAGAAGGTGGCGGACGCGCTGAGCCTCGCCGTGGAGCGCCTGGACGACCTACCCCA
CGCGCTGTCCGCGCTGAGCCACCTGCACGCGTGCCAGCTGCGAGTGGACCCGGCCAGCTTCCAGGTGAGCGGCTG
CCGTGCTGGGCCCCTGTCCCCGGGAGGGCCCCGGCGGGGTGGGTGCGGGGGGCGTGCGGGGCGGGTGCAGGCGAG
TGAGCCTTGAGCGCTCGCCGCAGCTCCTGGGCCACTGCCTGCTGGTAACCCTCGCCCGGCACTACCCCGGAGACT
TCAGCCCCGCGCTGCAGGCGTCGCTGGACAAGTTCCTGAGCCACGTTATCTCGGCGCTGGTTTCCGAGTACCGCT
GAACTGTGGGTGGGTGGCCGCGGGATCCCCAGGCGACCTTCCCCGTGTTTGAGTAAAGCCTCTCCCAGGAGCAGC
CTTCTTGCCGTGCTCTCTCGAGGTCAGGACGCGAGAGGAAGGCGC


To Add:
1.) New button for adding and editing bond types
2.) Demo button so users don't have to copy and paste XML

Known Issues To Fix:

1.) Fix bond dropdown showing all disulfide bonds
