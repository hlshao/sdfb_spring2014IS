var keys = {
	nodes: "0AhtG6Yl2-hiRdHdQM1JrS2JTRklaQ2M1ek41bEs5LVE",
	annot: "0AhtG6Yl2-hiRdGdjLVNKZmJkbkhhNDMzQm5BTzlHX0E"
}

var random = true;
var addNodes;
var addEdges;

document.addEventListener('DOMContentLoaded', function () {
	Tabletop.init({
		key: keys.nodes,
		callback: init
	});
	$("#accordion h3").click(function(){
		random = false;
	});
});

function node() {
	this.id = null;
	this.first = null;
	this.last = null;
	this.birth = null;
	this.death = null;
	this.label = null;
	this.name = null;
	this.occupation = null;
	this.edges = [];
}

function group() {
	this.id = null;
	this.name = null;
	this.nodes = null;
}

// Create a dictionnary of nodes and groups
function init(result) {
	var data = {
		nodes: {},
		groups: {},
		nodes_names: {},
		groups_names: {}
	};
	
	result.nodes.elements.forEach(function (row) {
		var n = new node();
		n.id = row.id;
		n.first = row.first;
		n.last = row.last;
		n.birth = row.birth;
		n.death = row.death; 
		n.occupation = row.occupation;
		n.label = row.first + ' ' + row.last;
		n.name =  n.label + ' (' + row.birth + ')';
		n.edges[0] = row.uncertain.split(', ');
		n.edges[1] = row.unlikely.split(', ');
		n.edges[2] = row.possible.split(', ');
		n.edges[3] = row.likely.split(', ');
		n.edges[4] = row.certain.split(', ');
		data.nodes[n.id] = n;
		data.nodes_names[n.name] = n.id;
	});

	result.groups.elements.forEach(function (row) {
		var g = new group();
		g.id  = row.id;
		g.name = row.name;
		g.nodes = row.nodes.split(', ');
		data.groups[g.id] = g;
		data.groups_names[g.name] = g;
	});

	initGraph(data);
}

// Populate the suggested drop-down menus
// Make the buttons in the search panel functional
function initGraph(data){
	
	populateLists(data);
	
	showRandomNode(data);

	$("#findonenode").click(function () {
		if ($("#one").val()) {
			Pace.restart();
			showOneNode(data.nodes_names[$("#one").val()], parseInt($('#confidence1')[0].value), data);
			$('#twogroupsmenu').css('display','none');
		}
		resetInputs();
	});

	$("#findtwonode").click(function () {
		if ($("#two").val() && $("#three").val()) {
			Pace.restart();
			showTwoNodes(data.nodes_names[$("#two").val()], data.nodes_names[$("#three").val()], parseInt($('#confidence2')[0].value), data);			
			$('#twogroupsmenu').css('display','none');
		}
		resetInputs();
	});

	$("#findonegroup").click(function () {
		if ($("#four").val()) {
			Pace.restart();
			showOneGroup($("#four").val(), data);
			$('#twogroupsmenu').css('display','none');
		}
		resetInputs();
	});

	$("#findtwogroup").click(function () {
		if ($("#five").val() && $("#six").val()) {
			Pace.restart();
			$('#group1').html($("#five").val());
			$('#group3').html($("#six").val());
			findInterGroup($("#group1").html(), $("#group3").html(), data);
		}
		resetInputs();
	});

	$("#group1").click(function () {
		showOneGroup($("#group1").html(), data);
	});

	$("#group3").click(function () {
		showOneGroup($("#group3").html(), data);
	});

	$("#group2").click(function () {
		findInterGroup($("#group1").html(), $("#group3").html(), data);
	});

	$('#submitnode').click(function(){
		Pace.restart();
		var name = $('#entry_1804360896').val() + ' ' + $('#entry_754797571').val();
		var date = $('#entry_524366257').val();
		$('section').css('display','none');
		$('#addedgeform').css('display','block');
		$('#entry_768090773').val(name + ' (' + date + ')');
		$('#graph').html('');
		$("#results").html('');
		addNodes = [];
		addEdges = [];
		addNodes.push({ "id": 0, "text": name, "size": 10, "cluster": getCluster(date) });
		var options = { width: $("#graph").width(), height: $("#graph").height(), colors: getColors() };
		var graph = new Insights($("#graph")[0], addNodes, [], options).render();
		var link = 'https://docs.google.com/spreadsheets/d/1-faviCW5k2v7DVOHpSQT-grRqNU1lBVkUjJEVfOvSs8/edit#gid=688870062';
		$.prompt("Thank you for your contribution! You can review your submission by going to <a href='"+link+"' target='_blank'>link</a>");
	});

	$('#submitedge').click(function(){
		Pace.restart();
		var target = data.nodes_names[$('#entry_1321382891').val()];
		var node = data.nodes[target];
		if (!node.id) { window.alert("Incorrect information. Please try again."); return;}
		if (addNodes.length == 0) {return;}
		$('#graph').html('');
		$("#results").html('');
		addNodes.push({ "id": node.id, "text": node.label, "size": 10, "cluster": getCluster(node.birth) });
		addEdges.push([0, node.id]);
		var options = { width: $("#graph").width(), height: $("#graph").height(), colors: getColors() };
		var graph = new Insights($("#graph")[0], addNodes, addEdges, options).render();
		var link = 'https://docs.google.com/spreadsheets/d/1cu7hpYQMWTO8C7F8V34BEbdB2NrUe1xsslWKoai3BWE/edit#gid=51712082';
		$.prompt("Thank you for your contribution! You can review your submission by going to <a href='"+link+"' target='_blank'>link</a>");
	});

	$('#submitgroup').click(function(){
		var link = 'https://docs.google.com/spreadsheet/ccc?key=0AhtG6Yl2-hiRdFFQS2hybWRXRVNkNVJXR2FENnhMM0E&usp=drive_web#gid=0';
		$.prompt("Thank you for your contribution! You can review your submission by going to <a href='"+link+"' target='_blank'>link</a>");
	});

	$("button.icon").click(function(){
		addNodes = [];
		addEdges = [];
		resetInputs();
	});
}

function showRandomNode(data) {
	if (!random) return;
	var keys = Object.keys(data.nodes);
	var id = data.nodes[keys[Math.floor(keys.length * Math.random())]].id;
	showOneNode(id, 2, data);
	if (random) {
		setTimeout(function(){
			showRandomNode(data)
		}, 15000);
	}
}

function getCluster(year){
	if (parseInt(year) < 1550) {return 0}
	if (parseInt(year) > 1700) {return 1}
	var cluster = Math.round((parseInt(year) - 1550) / 5);
	return (2 + cluster);
}

function getColors(){
	return { 0:  "#9dedd4", 1:  "#0c55ad", 2:  "#79BD8F", 3:  "#00A287", 4:  "#99CD7D", 
			 5:  "#349A98", 6:  "#558FCB", 7:  "#3A6BF9", 8:  "#6CDBE0", 9:  "#3C58A6",
			 10: "#B8DDF5", 11: "#6566AD", 12: "#BA9DCA", 13: "#532E8A", 14: "#CC71E2",
			 15: "#B53A83", 16: "#a573b1", 17: "#EF6097", 18: "#DE89B9", 19: "#F79484",
			 20: "#F3805D", 21: "#EF4B39", 22: "#F1623E", 23: "#FCBD3F", 24: "#F9ED45",
			 25: "#F79838", 26: "#FAF39A", 27: "#DADD45", 28: "#55C66D", 29: "#3EA8C1",
			 30: "#9ae8da", 31: "#2D71D3", }
}

var firstRandom = true; //if first time generating randomly
function showOneNode(id, confidence, data) {
	var p = data.nodes[id];
	var keys = {};
	var nodes = [];
	var edges = [];
	keys[p.id] = { "id": p.id, "text": p.label, "cluster": getCluster(p.birth), "size": p.edges[confidence].length };
	p.edges[confidence].forEach(function (i){
		var f = data.nodes[i];
		if (f) {
			keys[f.id] = { "id": f.id, "text": f.label, "cluster": getCluster(f.birth), "size": f.edges[confidence].length };
			if (notInArray(edges, [p.id, f.id])) { edges.push([p.id, f.id]); }
			f.edges[confidence].forEach(function (j){
				var s = data.nodes[j];
				if (s) {
					keys[s.id] = { "id": s.id, "text": s.label, "cluster": getCluster(s.birth), "size": s.edges[confidence].length };
					if (notInArray(edges, [f.id, s.id])) { edges.push([f.id, s.id]); }
					s.edges[confidence].forEach(function (k){
						var t = data.nodes[k];
						if (t && t.id in keys && notInArray(edges, [s.id, t.id])) { edges.push([s.id, t.id]); }
					});
				}
			});
		}
	});
	for (n in keys) { nodes.push(keys[n]); }
	$('#graph').html('');
	$("#results").html("Network of <b>" + p.name +"</b>");
	if (firstRandom){ //first time generating random node
		console.log("first time");
		var options = { width: $("#graph").width(), height: '800', colors: getColors() };
		firstRandom = false;
	} else {
		console.log("not first time");
		var options = { width: $("#graph").width(), height: $("#graph").height(), colors: getColors() };
	}
	var graph = new Insights($("#graph")[0], nodes, edges, options).render();
	graph.on("node:click", function(d) {
		random = false;
		var clicked = data.nodes[d.id];
		showNodeInfo(clicked, findGroups(clicked, data));
	});
	graph.on("edge:click", function(d) {
		random = false;
		Pace.restart();
		var id1 = parseInt(d.source.id);
		var id2 = parseInt(d.target.id);
		getAnnotation(id1 < id2 ? id1 : id2, id1 > id2 ? id1 : id2, data);
	});
	showNodeInfo(p, findGroups(p, data));
}

function notInArray(arr, val) {
	var i = arr.length;
	while (i--) {
		if (arr[i][0] == val[0] && arr[i][1] == val[1]) {
			return false;
		}
		if (arr[i][1] == val[0] && arr[i][0] == val[1]) {
			return false;
		}
	}
	return true;
}

// Returns list of groups that a node belongs to
function findGroups(node, data){
	var groups = [];
	for(var key in data.groups){
		if ((data.groups[key].nodes).indexOf(node.id)>-1)
			groups.push(data.groups[key].name);
	}
	var strgroups = groups.join(', ')
	return strgroups;
}

// Display node information
function showNodeInfo(data, groups){
	accordion("node");
	$("#node-name").text(data.first+ " "+ data.last);
	$("#node-bdate").text(data.birth);
	$("#node-ddate").text(data.death);
	$("#node-significance").text(data.occupation);
	$("#node-group").text(groups);
	var d = new Date();
	$("#node-cite").text( data.first+ " "+ data.last + " Network Visualization. \n Six Degrees of Francis Bacon: Reassembling the Early Modern Social Network. Gen. eds. Daniel Shore and Christopher Warren. "+d.getMonth()+"/"+d.getDate()+"/"+d.getFullYear()+" <http://sixdegreesoffrancisbacon.com/>");
	$("#node-DNBlink").attr("href", "http://www.oxforddnb.com/search/quick/?quicksearch=quicksearch&docPos=1&searchTarget=people&simpleName="+data.first+"-"+data.last+"&imageField.x=0&imageField.y=0&imageField=Go");//"http://www.oxforddnb.com/view/article/"+data.id);
	$("#node-GoogleLink").attr("href", "http://www.google.com/search?q="+data.first+"+"+ data.last);
}


// Display shared network of two nodes
function showTwoNodes(id1, id2, confidence, data) {
	if (id1 === id2) return;
	var keys = {};
	var nodes = [];
	var edges = [];
	var p1 = data.nodes[id1];
	var p2 = data.nodes[id2];
	keys[p1.id] = { "id": p1.id, "text": p1.label, "cluster": getCluster(p1.birth), "size": p1.edges[confidence].length };
	keys[p2.id] = { "id": p2.id, "text": p2.label, "cluster": getCluster(p2.birth), "size": p2.edges[confidence].length };
	p1.edges.forEach(function (list){
		if (list.indexOf(p2.id) > -1) { edges.push([p1.id, p2.id]); return; }
	});
	p1.edges[confidence].forEach(function (e){
		if (p2.edges[confidence].indexOf(e) > -1) {
			var f = data.nodes[e];
			keys[f.id] = { "id": f.id, "text": f.label, "cluster": getCluster(f.birth), "size": f.edges[confidence].length };
			edges.push([p1.id, f.id]);
			edges.push([p2.id, f.id]);
		}
	});
	p1.edges[confidence].forEach(function (i){
		var f = data.nodes[i];
		f.edges[confidence].forEach(function (j){
			if (p2.edges[confidence].indexOf(j) > -1) {
				var s = data.nodes[j];
				if (f.id != p2.id && s.id != p1.id) {
					keys[f.id] = { "id": f.id, "text": f.label, "cluster": getCluster(f.birth), "size": f.edges[confidence].length };
					keys[s.id] = { "id": s.id, "text": s.label, "cluster": getCluster(s.birth), "size": s.edges[confidence].length };
					if (notInArray(edges, [p1.id, f.id])) { edges.push([p1.id, f.id]); }
					if (notInArray(edges, [p2.id, s.id])) { edges.push([p2.id, s.id]); }
					if (notInArray(edges, [f.id,  s.id])) { edges.push([f.id,  s.id]); }
				}
			}
		});
	});
	for (n in keys) { nodes.push(keys[n]); }
	$('#graph').html('');
	$("#results").html("Common network between <b>" + p1.label + "</b> and <b>" + p2.label + "</b>");
	var options = { width: $("#graph").width(), height: $("#graph").height(), colors: getColors() };
	var graph = new Insights($("#graph")[0], nodes, edges, options).render();
	graph.on("node:click", function(d) {
		var clicked = data.nodes[d.id];
		showNodeInfo(clicked, findGroups(clicked, data));
	});
}

function showOneGroup(group, data) {
	var g = data.groups_names[group];
	var results = [];
	g.nodes.forEach(function (n) {	
		results.push(data.nodes[n]);
	});
	if (results.length == 0) { return }
	writeGroupTable(results, "People who belong to the " + group + " group");
	$("#results").html("People who belong to the <b>" + group + "</b> group");
}

// Display the intersections between two groups
function findInterGroup(group1, group2, data) {
	var g1 = data.groups_names[group1];
	var g2 = data.groups_names[group2];
	var common = [];
	g1.nodes.forEach(function (node) {
		if (g2.nodes.indexOf(node) >= 0) {
			common.push(data.nodes[node]);
		}
	});
	writeGroupTable(common, "Intersection between " + group1 + " and " + group2);
	$("#results").html("Intersection between <b>" + group1 + "</b> and <b>" + group2 + "</b>");
}

// Create the table container
function writeGroupTable(dataSource, title){
    $('#graph').html('<table cellpadding="0" cellspacing="0" border="0" class="display table table-bordered table-striped" id="data-table-container"></table>');
    $('#data-table-container').dataTable({
		'sPaginationType': 'bootstrap',
		'iDisplayLength': 100,
        'aaData': dataSource,
        'aoColumns': [
            {'mDataProp': 'first', 'sTitle': 'First Name'},
            {'mDataProp': 'last', 'sTitle': 'Last Name'},
            {'mDataProp': 'birth', 'sTitle': 'Birth Date'},
            {'mDataProp': 'death', 'sTitle': 'Death Date'},
            {'mDataProp': 'occupation', 'sTitle': 'Historical Significance'}
        ],
        'oLanguage': {
            'sLengthMenu': '_MENU_ records per page'
        }
    });
    downloadData(dataSource, title);
};

// Define two custom functions (asc and desc) for string sorting
jQuery.fn.dataTableExt.oSort['string-case-asc']  = function(x,y) {
	return ((x < y) ? -1 : ((x > y) ?  0 : 0));
};

jQuery.fn.dataTableExt.oSort['string-case-desc'] = function(x,y) {
	return ((x < y) ?  1 : ((x > y) ? -1 : 0));
};

function downloadData(data, title) {
	var result = title + " \n" + 'First Name,Last Name,Birth Date,Death Date,Historical Significance' + "\n";
	data.forEach(function (cell) {
		result += cell["first"] + ',' + cell["last"] + ',' + cell["birth"] + ',' + cell["death"] + ',' + cell["occupation"] + "\n";
	});
	var dwnbtn = $('<a href="data:text/csv;charset=utf-8,' + encodeURIComponent(result) + ' "download="' + title + '.csv"><div id="download"></div></a>');
	$(dwnbtn).appendTo('#graph');
}

function getAnnotation(id1, id2,data) {
	// var k = Math.ceil((p.id + 1) / 250) / 10;
	// var key = keys['edges' + Math.ceil(k)];
	console.log(id1 + ' ' + id2);
	Tabletop.init({
		key: keys.annot,
		query: 'source= ' + id1 + ' and target= ' + id2,
		simpleSheet: true,
		callback: function(result) {
			result.forEach(function (row){
				accordion("edge");			
				$("#edge-nodes").html(data.nodes[id1].first +" "+data.nodes[id1].last + " & " + data.nodes[id2].first+" "+data.nodes[id2].last);
				$("#edge-confidence").html(getConfidence(row.confidence));
				$("#edge-annotation").html(row.annotation);
				return true;
			});
		}
	});
}

function getConfidence(c) {
	if (c < 0.4) return "Very unlikely";
	else if (c < 0.5) return "Unlikely";
	else if (c < 0.7) return "Possible";
	else if (c < 0.9) return "Likely";
	else return "Certain";
}

function populateLists(data){
	$('#one').typeahead({
		local: Object.keys(data.nodes_names).sort()
	});
	$('#two').typeahead({
		local: Object.keys(data.nodes_names).sort()
	});
	$('#three').typeahead({
		local: Object.keys(data.nodes_names).sort()
	});
	$('#entry_768090773').typeahead({
		local: Object.keys(data.nodes_names).sort()
	});
	$('#entry_1321382891').typeahead({
		local: Object.keys(data.nodes_names).sort()
	});
	$('#entry_1177061505').typeahead({
		local: Object.keys(data.nodes_names).sort()
	});
	$('#four').typeahead({
		local: Object.keys(data.groups_names).sort()
	});
	$('#five').typeahead({
		local: Object.keys(data.groups_names).sort()
	});
	$('#six').typeahead({
		local: Object.keys(data.groups_names).sort()
	});
	$('#entry_110233074').typeahead({
		local: Object.keys(data.groups_names).sort()
	});
}

function resetInputs(){
	$("#one").val('');
	$("#one").typeahead('setQuery', '');
	$("#two").val('');
	$("#two").typeahead('setQuery', '');
	$("#three").val('');
	$("#three").typeahead('setQuery', '');
	$("#four").val('');
	$("#four").typeahead('setQuery', '');
	$("#five").val('');
	$("#five").typeahead('setQuery', '');
	$("#six").val('');
	$("#six").typeahead('setQuery', '');

	document.getElementById('googleaddnode').reset();
	document.getElementById('googleaddedge').reset();
    document.getElementById('googleaddgroup').reset();
}